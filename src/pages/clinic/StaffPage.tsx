import StaffManager from '../../components/clinic/StaffManager';

const StaffPage = () => {
    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Staff Management</h1>
            <StaffManager />
        </div>
    );
};

export default StaffPage;
