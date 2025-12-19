import { Outlet } from 'react-router-dom';
import PageLayout from './PageLayout';

const MainLayout = () => {
    return (
        <PageLayout>
            <Outlet />
        </PageLayout>
    );
};

export default MainLayout;
