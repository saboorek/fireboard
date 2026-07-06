import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBuilding, faUser, faPhone, faLocationDot, faGlobe,
} from '@fortawesome/free-solid-svg-icons';
import type { Business } from '../../services/businessService';

interface Props {
    business: Business;
}

export const BusinessInfo = ({ business }: Props) => (
    <div className="bg-gray-900 rounded-xl p-5">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
            <FontAwesomeIcon icon={faBuilding} className="mr-2" />
            Informacje o biznesie
        </h2>
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={faUser} className="text-gray-500 w-4" />
                <div>
                    <p className="text-gray-500 text-xs">Właściciel</p>
                    <p className="text-white text-sm">{business.ownerName}</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={faPhone} className="text-gray-500 w-4" />
                <div>
                    <p className="text-gray-500 text-xs">Telefon</p>
                    <p className="text-white text-sm">{business.ownerPhone}</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={faLocationDot} className="text-gray-500 w-4" />
                <div>
                    <p className="text-gray-500 text-xs">Adres</p>
                    <p className="text-white text-sm">{business.address}</p>
                </div>
            </div>
            {business.website && (
                <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faGlobe} className="text-gray-500 w-4" />
                    <div>
                        <p className="text-gray-500 text-xs">Strona</p>
                        <a href={business.website} target="_blank" rel="noreferrer" className="text-blue-400 text-sm hover:underline">
                            {business.website}
                        </a>
                    </div>
                </div>
            )}
            <div className="border-t border-gray-700 pt-3 mt-1">
                <p className="text-gray-500 text-xs">Ostatnia kontrola</p>
                <p className="text-white text-sm">
                    {business.lastInspectionDate
                        ? new Date(business.lastInspectionDate).toLocaleDateString('pl-PL')
                        : 'Brak danych'
                    }
                </p>
            </div>
        </div>
    </div>
);