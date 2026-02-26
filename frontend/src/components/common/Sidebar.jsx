import { GraduationCap, LayoutDashboard, LogOut } from 'lucide-react';

export default function Sidebar({ userEmail, role, onLogout }) {
    return (
        <aside className="w-72 min-w-[18rem] bg-slate-900 text-white flex flex-col shadow-2xl z-50 h-full shrink-0">
            
            <div className="py-8 px-2 border-b border-slate-800 flex flex-col items-center justify-center text-center gap-4">
                <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-900/50">
                    <GraduationCap className="w-8 h-8 text-white" />
                </div>
                
                <div className="w-full">
                    <h1 className="font-bold text-xl text-white leading-tight break-normal whitespace-normal tracking-tight px-1">
                        Gestão Acadêmica
                    </h1>
                    <p className="text-xs text-blue-400 font-medium mt-1 tracking-wider">IFSP System v1.0</p>
                </div>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
                <div className="mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 shadow-inner">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-bold text-white shadow-lg shrink-0 border-2 border-slate-700">
                            {userEmail ? userEmail.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div className="overflow-hidden text-left">
                            <p className="text-sm font-semibold text-slate-200 truncate" title={userEmail}>
                                {userEmail ? userEmail.split('@')[0] : 'Usuário'}
                            </p>
                            <p className="text-[10px] text-blue-300 uppercase font-bold tracking-wider truncate">
                                {role ? role.replace('ROLE_', '') : ''}
                            </p>
                        </div>
                    </div>
                </div>

                <nav className="space-y-2">
                    <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-900/20 text-sm font-medium transition-all hover:brightness-95 active:scale-95">
                        <LayoutDashboard className="w-5 h-5 shrink-0" /> 
                        <span>Dashboard Principal</span>
                    </button>
                </nav>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900">
                <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 py-3 rounded-xl text-sm font-medium transition-all border border-transparent hover:border-red-500/20">
                    <LogOut className="w-4 h-4 shrink-0" /> 
                    <span>Encerrar Sessão</span>
                </button>
            </div>
        </aside>
    );
}