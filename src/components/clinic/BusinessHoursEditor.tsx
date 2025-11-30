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

const DAYS_MAP = {
    mon: '月',
    tue: '火',
    wed: '水',
    thu: '木',
    fri: '金',
    sat: '土',
    sun: '日',
} as const;

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
        <div className="space-y-1">
            {DAYS.map(day => {
                const isClosed = value[day]?.isClosed;

                return (
                    <div key={day} className={`flex items-center justify-between p-3 rounded-lg transition-colors ${isClosed ? 'bg-gray-50' : 'hover:bg-blue-50'}`}>
                        {/* Day Label */}
                        <div className="flex items-center w-12 shrink-0">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${day === 'sun' ? 'bg-red-100 text-red-600' :
                                    day === 'sat' ? 'bg-blue-100 text-blue-600' :
                                        'bg-gray-100 text-gray-600'
                                }`}>
                                {DAYS_MAP[day]}
                            </div>
                        </div>

                        {/* Content Area (Times or Closed Text) */}
                        <div className="flex-1 flex items-center justify-center px-2">
                            {isClosed ? (
                                <span className="text-gray-400 font-medium text-sm tracking-widest">
                                    ー 休 診 ー
                                </span>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="time"
                                        value={value[day]?.start}
                                        onChange={(e) => handleChange(day, 'start', e.target.value)}
                                        className="px-2 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none bg-white w-[5.5rem] text-center font-mono shadow-sm"
                                    />
                                    <span className="text-gray-400 font-bold text-sm">～</span>
                                    <input
                                        type="time"
                                        value={value[day]?.end}
                                        onChange={(e) => handleChange(day, 'end', e.target.value)}
                                        className="px-2 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none bg-white w-[5.5rem] text-center font-mono shadow-sm"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Toggle Checkbox */}
                        <div className="flex items-center justify-end w-12 shrink-0">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={!isClosed}
                                    onChange={(e) => handleChange(day, 'isClosed', !e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default BusinessHoursEditor;
