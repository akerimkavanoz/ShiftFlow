import { useState } from 'react';
import { Building2, Users, CalendarDays, LayoutDashboard, CalendarPlus } from 'lucide-react';
import DepartmentManagement from './pages/DepartmentManagement';
import EmployeeManagement from './pages/EmployeeManagement';
import ShiftManagement from './pages/ShiftManagement'; 
import ShiftAssignmentManagement from './pages/ShiftAssignmentManagement'; 

export default function App() {
  const [activePage, setActivePage] = useState('departments');

  const menuItems = [
    { 
      id: 'dashboard', 
      name: 'Dashboard', 
      icon: LayoutDashboard,
      description: 'Sistem genelindeki özet verileri ve analizleri buradan inceleyebilirsiniz.'
    },
    { 
      id: 'departments', 
      name: 'Departman Yönetimi', 
      icon: Building2,
      description: 'Şirket bünyesindeki departmanları listeleyebilir, yeni departman ekleyebilir veya düzenleyebilirsiniz.'
    },
    { 
      id: 'employees', 
      name: 'Personel Yönetimi', 
      icon: Users,
      description: 'Çalışan personellerin bilgilerini, kayıtlarını ve bağlı oldukları departmanları buradan yönetin.'
    },
    { 
      id: 'shifts', 
      name: 'Vardiya Yönetimi', 
      icon: CalendarDays,
      description: 'Sistemde aktif olarak kullanılan çalışma saatlerini ve vardiya şablonlarını tanımlayın.'
    },
    { 
      id: 'shiftAssignments', 
      name: 'Vardiya Atama', 
      icon: CalendarPlus,
      description: 'Personellerin haftalık vardiya düzenini buradan hızlıca planlayabilirsiniz.'
    }, 
  ];

  const currentPage = menuItems.find(m => m.id === activePage) || menuItems[0];
  const PageIcon = currentPage.icon;

  return (
    <div className="flex h-screen bg-gray-50 font-sans antialiased text-gray-800">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col shadow-xl shrink-0 hidden md:flex">
        
        {/* LOGO & BAŞLIK ALANI */}
        <div className="p-5 flex flex-col items-center justify-center text-center gap-3 border-b border-slate-800">
          
          {/* LOGOYU AÇIK RENK KART İÇİNE ALAN KUTU */}
          <div className="w-full bg-white p-2.5 rounded-2xl shadow-lg border border-slate-700/30 flex items-center justify-center">
            <img 
              src="/assets/logo.png"
              alt="Logo" 
              className="w-auto h-14 max-w-full object-contain"
            />
          </div>

          {/* BAŞLIK & ETİKET */}
          <div className="space-y-0.5 pt-1">
            <h1 className="font-extrabold text-base tracking-wider text-white leading-tight uppercase">
              VARDİYA AKIŞI
            </h1>
            <span className="text-[10px] text-orange-400 font-bold tracking-widest uppercase block">
              ERP Yönetim Paneli
            </span>
          </div>

        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-800 text-center text-xs text-slate-500">Vardiya Akışı v1.0.0</div>
      </aside>

      {/* SAĞ İÇERİK ALANI */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="bg-white p-5 border-b border-gray-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shrink-0 min-h-[90px]">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-2.5 rounded-xl text-orange-600 flex items-center justify-center">
              <PageIcon className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-bold text-gray-800 leading-tight">
                {currentPage.name}
              </h3>
              <p className="text-[11px] md:text-xs text-gray-500 font-medium mt-0.5">
                {currentPage.description}
              </p>
            </div>
          </div>
        </header>

        <section className="p-4 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {activePage === 'departments' && <DepartmentManagement />}
          {activePage === 'employees' && <EmployeeManagement />}
          {activePage === 'shifts' && <ShiftManagement />}
          {activePage === 'shiftAssignments' && <ShiftAssignmentManagement />}

          {activePage === 'dashboard' && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-base font-semibold text-gray-700">Dashboard Çok Yakında...</h3>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}