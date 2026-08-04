import config from '../utils/config';

export interface Note {
    _id: string;
    content: string;
    author: string;
    createdAt: string;
}

export interface Report {
    _id: string;
    reportId: string;
    controlDate: string;
    inspector: string;
    controlPassed: boolean;
    controlDescription: string;
    alarmServices: boolean;
    controlType: 'Planowana' | 'Nieplanowana';
    novIssued?: boolean;
}

export interface Business {
    _id: string;
    customId: number;
    type: string;
    name: string;
    ownerName: string;
    ownerPhone: string;
    address: string;
    website?: string | null;
    notes: Note[];
    lastInspectionDate?: string | null;
    lastControlPassed?: boolean | null;
    activeNov?: {
        deadlineDate: string;
        deadlineDays: 7 | 14;
    } | null;
}

export interface AddNovPayload {
    reportMongoId: string;
    reportRef: string;
    deadlineDays: 7 | 14;
    violations: string[];
    issuedBy: string;
}

export interface AddReportPayload {
    controlDate: string;
    inspector: string;
    controlPassed: boolean;
    controlDescription: string;
    alarmServices: boolean;
    controlType: 'Planowana' | 'Nieplanowana';
}

export interface Citation {
    _id: string;
    citationId: string;
    inspector: string;
    citationDate: string;
    citationAmount: number;
    citationReason: string;
}

export interface AddCitationPayload {
    inspector: string;
    citationDate: string;
    citationAmount: number;
    citationReason: string;
}

const base = (id: string) => `${config.URL}/businesses/${id}`;

export const businessService = {
    fetchOne: (id: string) =>
        fetch(base(id), { credentials: 'include' }).then(r => {
            if (!r.ok) throw new Error();
            return r.json() as Promise<Business>;
        }),

    update: (id: string, body: object) =>
        fetch(base(id), {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        }),

    remove: (id: string) =>
        fetch(base(id), { method: 'DELETE', credentials: 'include' }),

    addNote: (id: string, content: string) =>
        fetch(`${base(id)}/notes`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content }),
        }),

    deleteNote: (id: string, noteId: string) =>
        fetch(`${base(id)}/notes/${noteId}`, { method: 'DELETE', credentials: 'include' }),

    fetchReports: (id: string) =>
        fetch(`${base(id)}/reports`, { credentials: 'include' }).then(r => {
            if (!r.ok) throw new Error();
            return r.json() as Promise<Report[]>;
        }),

    addReport: (id: string, payload: AddReportPayload) =>
        fetch(`${base(id)}/reports`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        }),

    deleteReport: (id: string, reportId: string) =>
        fetch(`${base(id)}/reports/${reportId}`, { method: 'DELETE', credentials: 'include' }),

    fetchCitations: (id: string) =>
        fetch(`${base(id)}/citations`, { credentials: 'include' }).then(r => {
            if (!r.ok) throw new Error();
            return r.json() as Promise<Citation[]>;
        }),

    addCitation: (id: string, payload: AddCitationPayload) =>
        fetch(`${base(id)}/citations`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        }),

    deleteCitation: (id: string, citationId: string) =>
        fetch(`${base(id)}/citations/${citationId}`, { method: 'DELETE', credentials: 'include' }),

    addNov: (id: string, payload: AddNovPayload) =>
        fetch(`${base(id)}/nov`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        }),
};

