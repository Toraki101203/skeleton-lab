import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, ArrowRight } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const ClinicDashboard = () => {
    const { user } = useAuth();
    const [clinicName, setClinicName] = useState<string>('');
    const [stats, setStats] = useState({
        todayBookings: 0,
        avgWaitTime: 0,
        monthlyPv: 0,
        todayBookingsDiff: 0,
        monthlyPvDiff: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.uid) return;

            // 1. Get Clinic Info
            const { data: clinic } = await supabase
                .from('clinics')
                .select('id, name')
                .eq('owner_uid', user.uid)
                .single();

            if (clinic) {
                setClinicName(clinic.name);
                const clinicId = clinic.id;

                // 2. Get Today's Bookings
                const today = new Date().toISOString().split('T')[0];
                const { count: todayCount } = await supabase
                    .from('bookings')
                    .select('*', { count: 'exact', head: true })
                    .eq('clinic_id', clinicId)
                    .gte('start_time', `${today}T00:00:00`)
                    .lte('start_time', `${today}T23:59:59`);

                // Mock Diff for now (or fetch yesterday)
                const todayDiff = 2;

                // 3. Get Monthly PV
                const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
                const { data: pvData } = await supabase
                    .from('clinic_daily_stats')
                    .select('page_views')
                    .eq('clinic_id', clinicId)
                    .gte('date', firstDayOfMonth);

                const totalPv = pvData?.reduce((sum, row) => sum + row.page_views, 0) || 0;

                // 4. Calculate Avg Wait Time (Mock logic for now as we need real check-in data)
                // In production, this would query bookings with checked_in_at
                const avgWait = 15;

                setStats({
                    todayBookings: todayCount || 0,
                    avgWaitTime: avgWait,
                    monthlyPv: totalPv,
                    todayBookingsDiff: todayDiff,
                    monthlyPvDiff: 12 // Mock
                });
            }
        };
        fetchData();
    }, [user]);

    return (
        <PageLayout>
            <div className="max-w-6xl mx-auto px-6 py-12">
                {/* Header Section */}
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">加盟院管理ダッシュボード</h1>
                        <p className="text-gray-700 font-medium">
                            ようこそ、<span className="font-bold text-blue-600 text-lg">{clinicName || user?.email || 'ゲスト'}</span> 様。
                            本日の予約状況と医院情報を管理できます。
                        </p>
                    </div>
                    <div className="text-right hidden md:block">
                        <div className="text-sm text-gray-600 font-bold mb-1">本日の日付</div>
                        <div className="text-xl font-mono font-bold text-gray-700">
                            {new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-200">
                        <div className="flex items-center justify-end mb-4">
                            <span className="text-sm font-medium opacity-80">本日の予約</span>
                        </div>
                        <div className="text-4xl font-bold mb-1">{stats.todayBookings}<span className="text-lg font-normal opacity-80 ml-1">件</span></div>
                        <div className="text-xs opacity-70">前日比 +{stats.todayBookingsDiff}件</div>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-end mb-4">
                            <span className="text-sm font-medium text-gray-500">平均待ち時間</span>
                        </div>
                        <div className="text-4xl font-bold text-gray-800 mb-1">{stats.avgWaitTime}<span className="text-lg font-normal text-gray-400 ml-1">分</span></div>
                        <div className="text-xs text-green-500">通常通り</div>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-end mb-4">
                            <span className="text-sm font-medium text-gray-500">今月のアクセス</span>
                        </div>
                        <div className="text-4xl font-bold text-gray-800 mb-1">{stats.monthlyPv.toLocaleString()}<span className="text-lg font-normal text-gray-400 ml-1">PV</span></div>
                        <div className="text-xs text-green-500">先月比 +{stats.monthlyPvDiff}% ↗</div>
                    </div>
                </div>

                {/* Main Menu Grid */}
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <LayoutDashboard className="w-5 h-5 mr-2 text-primary" />
                    管理メニュー
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Profile Editor */}
                    <Link to="/clinic/profile" className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 relative overflow-hidden flex flex-col h-full">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10 flex-1 flex flex-col">
                            <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-primary transition-colors mt-2">基本情報・診療時間</h3>
                            <p className="text-gray-500 text-sm mb-6 leading-relaxed flex-1">
                                医院の基本情報、住所、電話番号、診療時間の設定や、掲載写真の管理を行います。
                            </p>
                            <div className="flex items-center text-primary font-bold text-sm mt-auto">
                                編集する <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </Link>

                    {/* Staff Management */}
                    <Link to="/clinic/staff" className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 relative overflow-hidden flex flex-col h-full">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10 flex-1 flex flex-col">
                            <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-green-600 transition-colors mt-2">スタッフ管理</h3>
                            <p className="text-gray-500 text-sm mb-6 leading-relaxed flex-1">
                                医師やスタッフの登録・編集、シフト管理や権限設定を行います。
                            </p>
                            <div className="flex items-center text-green-600 font-bold text-sm mt-auto">
                                管理画面へ <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </Link>

                    {/* Menu Management */}
                    <Link to="/clinic/menu" className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 relative overflow-hidden flex flex-col h-full">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10 flex-1 flex flex-col">
                            <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors mt-2">メニュー・施術管理</h3>
                            <p className="text-gray-500 text-sm mb-6 leading-relaxed flex-1">
                                提供する施術メニューの作成、料金設定、説明文の編集を行います。
                            </p>
                            <div className="flex items-center text-orange-600 font-bold text-sm mt-auto">
                                作成する <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </Link>

                    {/* Shift Management */}
                    <Link to="/clinic/shifts" className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 relative overflow-hidden flex flex-col h-full">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10 flex-1 flex flex-col">
                            <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors mt-2">シフト管理</h3>
                            <p className="text-gray-500 text-sm mb-6 leading-relaxed flex-1">
                                スタッフの出勤日や休日の設定、日ごとのシフト調整を行います。
                            </p>
                            <div className="flex items-center text-purple-600 font-bold text-sm mt-auto">
                                設定する <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </Link>

                    {/* Attendance Management */}
                    <Link to="/clinic/attendance" className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 relative overflow-hidden flex flex-col h-full">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10 flex-1 flex flex-col">
                            <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-pink-600 transition-colors mt-2">勤怠管理</h3>
                            <p className="text-gray-500 text-sm mb-6 leading-relaxed flex-1">
                                スタッフの出勤・退勤記録の確認や修正を行います。
                            </p>
                            <div className="flex items-center text-pink-600 font-bold text-sm mt-auto">
                                確認する <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </Link>

                    {/* Reservation Management */}
                    <Link to="/clinic/reservations" className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 relative overflow-hidden flex flex-col h-full">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10 flex-1 flex flex-col">
                            <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors mt-2">予約管理</h3>
                            <p className="text-gray-500 text-sm mb-6 leading-relaxed flex-1">
                                予約の確認、変更、キャンセル対応などを行います。
                            </p>
                            <div className="flex items-center text-indigo-600 font-bold text-sm mt-auto">
                                管理画面へ <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </PageLayout>
    );
};

export default ClinicDashboard;
