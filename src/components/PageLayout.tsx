import { ReactNode } from 'react';
import Header from './Header';
import { Skull, Activity } from 'lucide-react';

interface PageLayoutProps {
    children: ReactNode;
    className?: string;
}

const PageLayout = ({ children, className = "" }: PageLayoutProps) => {
    return (
        <div className="min-h-screen bg-primary text-white font-sans relative overflow-hidden flex flex-col">
            <Header />

            {/* Background Decorations */}
            <div className="absolute top-20 right-[-50px] opacity-10 pointer-events-none">
                <Skull className="w-96 h-96 rotate-12" />
            </div>
            <div className="absolute bottom-[-50px] left-[-50px] opacity-5 pointer-events-none">
                <Activity className="w-80 h-80 -rotate-12" />
            </div>

            <main className={`container mx-auto px-4 pt-32 pb-32 relative z-10 flex-grow ${className}`}>
                {children}
            </main>

            {/* Footer Wave */}
            <div className="absolute bottom-0 left-0 right-0 z-0 pointer-events-none">
                <svg viewBox="0 0 1440 320" className="w-full h-auto text-white fill-current">
                    <path fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                </svg>
            </div>
        </div>
    );
};

export default PageLayout;
