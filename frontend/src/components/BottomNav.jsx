import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Calendar, LayoutDashboard, MessageSquare, Camera } from 'lucide-react';

const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();

    const navItems = [
        {
            label: '일정',
            icon: Calendar,
            path: `/meeting/${id}/schedule`,
        },
        {
            label: '회비',
            icon: LayoutDashboard,
            path: `/meeting/${id}/dashboard`,
        },
        {
            label: '게시판',
            icon: MessageSquare,
            path: `/meeting/${id}/board`,
        },
        {
            label: '스마트 스캔',
            icon: Camera,
            path: `/meeting/${id}/ocr`,
        },
    ];

    const isActive = (path) => {
        if (path.includes('schedule') && location.pathname.includes('/detail/')) return true;
        return location.pathname === path;
    };

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50 pb-safe">
            <div className="flex items-center justify-around h-16">
                {navItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <button
                            key={item.label}
                            onClick={() => navigate(item.path)}
                            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${active ? 'text-primary' : 'text-muted-foreground hover:text-gray-900'
                                }`}
                            aria-label={`${item.label} 페이지로 이동`}
                        >
                            <item.icon className={`w-6 h-6 ${active ? 'fill-primary/10' : ''}`} />
                            <span className="text-[12px] font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;
