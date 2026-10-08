import { PageWrapper } from '../components/PageWrapper';
import { GlassCard } from '../components/GlassCard';
import { useThemeStore } from '../store/themeStore';
import { MapPin } from 'lucide-react';

const locations = [
  {
    id: 1,
    name: 'Hinjewadi',
    address: 'Precision Bike Zone Shop No 3, SS Food Park, near I AMSTERDAM Restaurant, Phase 1, Hinjawadi Rajiv Gandhi Infotech Park, Hinjawadi, Pune, Pimpri-Chinchwad, Maharashtra 411057'
  },
  {
    id: 2,
    name: 'Balewadi',
    address: 'Laxmi Nagar, Balewadi Gaon, Balewadi, Pune, Maharashtra 411045'
  },
  {
    id: 3,
    name: 'Wakad',
    address: 'BatteryPool, Geetali Market, Opp. Hotel Shivar Garden, Near More Shop, Pimple Saudagar, Pune, Maharashtra 411027'
  },
  {
    id: 4,
    name: 'Viman Nagar',
    address: 'BatteryPool, Hermes Minor Building, Besides Satyam Arcade, Ramwadi Metro Station, Viman Nagar, Pune Nagar Road, Pune - 411014'
  },
  {
    id: 5,
    name: 'Narhe',
    address: 'SATYAMLABS COMPUTER SERVICES (PUNE, MH), Ground, B-17, Plot No. 132, Shivam Corner, Sinhgad Road, Dhayari, Pune, Maharashtra 411041'
  },
  {
    id: 6,
    name: 'Mahalunge',
    address: 'Shop No. 4, BatteryPool, near VP Washing Centre, Mahalunge–Nande Road, near Godrej Hillside 1, Mahalunge, Pune – 411045'
  }
];

export default function BatteriesHubs() {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <PageWrapper className="flex flex-col px-6 pt-6 pb-24">
      <div className="mb-6">
        <h1 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Batteries Hubs</h1>
        <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Find the nearest battery swap locations</p>
      </div>

      {/* Map Placeholder */}
      <div className={`w-full h-48 rounded-2xl mb-6 flex items-center justify-center border-2 border-dashed ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-300'}`}>
        <div className="flex flex-col items-center gap-2 opacity-50">
          <MapPin size={32} className={isDark ? 'text-white' : 'text-slate-900'} />
          <span className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>Map View (Coming Soon)</span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {locations.map((loc) => (
          <GlassCard key={loc.id} className="p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 className={`font-black text-sm uppercase tracking-wider ${isDark ? 'text-flexigo-teal' : 'text-emerald-600'}`}>{loc.name}</h3>
            </div>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>
              {loc.address}
            </p>
          </GlassCard>
        ))}
      </div>
    </PageWrapper>
  );
}
