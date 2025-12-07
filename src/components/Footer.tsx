import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-white/10 backdrop-blur-md text-white py-12 relative z-20 border-t border-white/10">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-left">
                        <h2 className="text-2xl font-bold mb-2">Skeleton Lab.</h2>
                        <p className="text-white/60 text-sm">
                            カラダかろやか、ココロまろやか
                        </p>
                    </div>

                    <div className="flex gap-8 text-sm text-white/80">
                        <Link to="/concept" className="hover:text-white transition-colors">コンセプト</Link>
                        <Link to="/features" className="hover:text-white transition-colors">特徴</Link>
                        <Link to="/faq" className="hover:text-white transition-colors">よくある質問</Link>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-white/10 text-center text-xs text-white/40">
                    &copy; {new Date().getFullYear()} Skeleton Lab. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
