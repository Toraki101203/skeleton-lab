import type { BusinessHours } from '../../types';

interface Props {
    value: {
        mon: BusinessHours;
        tue: BusinessHours;
        wed: BusinessHours;
        thu: BusinessHours;
        fri: BusinessHours;
        sat: BusinessHours;
        sun: BusinessHours;
    };
    onChange: (value: {
        mon: BusinessHours;
        tue: BusinessHours;
        wed: BusinessHours;
        thu: BusinessHours;
        fri: BusinessHours;
        sat: BusinessHours;
        sun: BusinessHours;
    }) => void;
}

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

const BusinessHoursEditor: React.FC<Props> = ({ value, onChange }) => {
    const handleChange = (day: string, field: keyof BusinessHours, val: any) => {
        onChange({
            ...value,
            [day]: {
                ...value[day as keyof typeof value],
                [field]: val
            }
        } as typeof value);
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Business Hours</h3>
            <div className="space-y-3">
                {DAYS.map(day => (
                    <div key={day} className="flex items-center space-x-4 p-2 hover:bg-gray-50 rounded">
                        <div className="w-16 font-medium uppercase text-gray-500">{day}</div>

                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={value[day]?.isClosed}
                                onChange={(e) => handleChange(day, 'isClosed', e.target.checked)}
                                className="rounded text-accent focus:ring-accent"
                            />
                            <span className="text-sm text-gray-600">Closed</span>
                        </label>

                        {!value[day]?.isClosed && (
                            <div className="flex items-center space-x-2">
                                <input
                                    type="time"
                                    value={value[day]?.start}
                                    onChange={(e) => handleChange(day, 'start', e.target.value)}
                                    className="border rounded px-2 py-1 text-sm"
                                />
                                <span className="text-gray-400">-</span>
                                <input
                                    type="time"
                                    value={value[day]?.end}
                                    onChange={(e) => handleChange(day, 'end', e.target.value)}
                                    className="border rounded px-2 py-1 text-sm"
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BusinessHoursEditor;
