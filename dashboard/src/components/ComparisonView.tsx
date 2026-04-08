import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useComparisonData, type ComparisonData } from '../hooks/useComparisonData';

/* ── Progress Bar Helper ── */
function ProgressBar({ label, value, colorClass, bgClass, shadowClass }: { label: string, value: number | null, colorClass: string, bgClass: string, shadowClass?: string }) {
  const displayVal = value != null ? `${value > 0 ? '+' : ''}${value}%` : '—';
  // scale width up for visual effect, max 100%
  const width = value != null ? Math.min(Math.abs(value) * 5, 100) : 0;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm font-label">
        <span className="text-on-surface-variant font-medium">{label}</span>
        <span className={`font-bold ${colorClass}`}>{displayVal}</span>
      </div>
      <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
        <div 
          className={`h-full ${bgClass} rounded-full ${shadowClass || ''} transition-all duration-1000 ease-out`} 
          style={{ width: `${width}%` }} 
        />
      </div>
    </div>
  );
}

/* ── Market Column Component ── */
function MarketColumn({
  data,
  colorScheme,
  labelName,
  cityCode
}: {
  data: ComparisonData;
  colorScheme: 'primary' | 'tertiary';
  labelName: string;
  cityCode: string;
}) {
  const accentClass = colorScheme === 'primary' ? 'text-primary' : 'text-tertiary';
  const accentBgClass = colorScheme === 'primary' ? 'bg-primary' : 'bg-tertiary';
  const shadowClass = colorScheme === 'primary' 
    ? 'shadow-[0_0_12px_rgba(129,236,255,0.4)]' 
    : 'shadow-[0_0_12px_rgba(166,140,255,0.4)]';

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="relative rounded-2xl overflow-hidden h-64 group mb-10 border border-outline-variant/10">
        <CityImage cityName={data.marketName} cityCode={cityCode} />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
        <div className="absolute bottom-6 left-6">
          <div className={`flex items-center gap-2 ${accentClass} mb-1`}>
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
            <span className="font-label text-[10px] uppercase font-bold tracking-widest">{labelName}</span>
          </div>
          <h2 className="text-3xl font-headline font-extrabold text-on-surface">{data.marketName}</h2>
        </div>
        
        {data.loading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
            <span className={`material-symbols-outlined ${accentClass} animate-spin text-4xl`}>sync</span>
          </div>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/5">
          <span className="text-on-surface-variant font-label text-xs uppercase tracking-wider block mb-4">HUD 2-Bedroom FMR</span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-headline font-bold text-on-surface">{data.rent}</span>
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/5">
          <span className="text-on-surface-variant font-label text-xs uppercase tracking-wider block mb-4">Unemployment</span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-headline font-bold text-on-surface">{data.unemployment}</span>
            <span className={`text-sm font-bold font-label ${data.unemploymentTrend.includes('-') ? 'text-primary-dim' : 'text-error-dim'}`}>
              {data.unemploymentTrend}
            </span>
          </div>
        </div>
      </div>

      {/* Total Job Growth Card */}
      <div className="glass-panel p-8 rounded-3xl border border-outline-variant/10 shadow-xl overflow-hidden relative">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${accentClass} flex items-center justify-center`} style={{ backgroundColor: colorScheme === 'primary' ? 'rgba(129,236,255,0.1)' : 'rgba(166,140,255,0.1)' }}>
              <span className="material-symbols-outlined">insights</span>
            </div>
            <h3 className="font-headline font-bold text-lg">Total Nonfarm Job Growth</h3>
          </div>
          <span className="text-xs font-label text-on-surface-variant bg-surface-container-highest px-3 py-1 rounded-full">YoY</span>
        </div>
        <div className="flex items-baseline gap-2 relative z-10">
          <span className="text-6xl font-headline font-black text-on-surface drop-shadow-lg">{data.jobGrowth}</span>
        </div>
        {/* Abstract glow */}
        <div className={`absolute -bottom-10 -right-10 w-40 h-40 ${accentBgClass} rounded-full blur-[80px] opacity-20 pointer-events-none`} />
      </div>

      {/* Job Growth Velocity (Sectors) */}
      <div className="p-8 rounded-3xl bg-surface-container-high border border-outline-variant/10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${accentClass} flex items-center justify-center`} style={{ backgroundColor: colorScheme === 'primary' ? 'rgba(129,236,255,0.1)' : 'rgba(166,140,255,0.1)' }}>
              <span className="material-symbols-outlined">trending_up</span>
            </div>
            <h3 className="font-headline font-bold text-lg">Job Growth Velocity</h3>
          </div>
        </div>
        <div className="space-y-6">
          <ProgressBar label="Tech & Information" value={data.sectors.tech} colorClass={accentClass} bgClass={accentBgClass} shadowClass={shadowClass} />
          <ProgressBar label="Manufacturing" value={data.sectors.mfg} colorClass={accentClass} bgClass={`${accentBgClass}/70`} />
          <ProgressBar label="Professional Services" value={data.sectors.prof} colorClass={accentClass} bgClass={`${accentBgClass}/40`} />
        </div>
      </div>
    </div>
  );
}

const CITY_IMAGES: Record<string, string> = {
  "austin": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Austin_Downtown_2024.jpg/800px-Austin_Downtown_2024.jpg",
  "round-rock": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Dell_Diamond_Southwest_Entrance_2017.jpg/800px-Dell_Diamond_Southwest_Entrance_2017.jpg",
  "pflugerville": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Pflugerville_historic_district_2012.jpg/800px-Pflugerville_historic_district_2012.jpg",
  "georgetown": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Downtown_Georgetown.jpg/800px-Downtown_Georgetown.jpg",
  "cedar-park": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/HEB_Center_at_Cedar_Park_2022.jpg/800px-HEB_Center_at_Cedar_Park_2022.jpg",
  "san-marcos": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Hays_county_courthouse_historic_district_2013.jpg/800px-Hays_county_courthouse_historic_district_2013.jpg",
  "dallas": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/View_of_Dallas_from_Reunion_Tower_August_2015_05.jpg/800px-View_of_Dallas_from_Reunion_Tower_August_2015_05.jpg",
  "houston": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Texas_medical_center.jpg/800px-Texas_medical_center.jpg",
  "san-antonio": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/San_Antonio_Botanical_Garden_Overlook_View.jpg/800px-San_Antonio_Botanical_Garden_Overlook_View.jpg",
  "el-paso": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/El_Paso_Cityscape_%28cropped%29.jpg/800px-El_Paso_Cityscape_%28cropped%29.jpg",
  "seattle": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Seattle_Center_as_night_falls.jpg/800px-Seattle_Center_as_night_falls.jpg",
  "bellevue": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Bellevue_Downtown_Aerial%2C_May_2025.jpg/800px-Bellevue_Downtown_Aerial%2C_May_2025.jpg",
  "redmond": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Redmond_aerial%2C_April_2023.png/800px-Redmond_aerial%2C_April_2023.png",
  "portland": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Portland_Oregon_Aerial%2C_June_2025.jpg/800px-Portland_Oregon_Aerial%2C_June_2025.jpg",
  "san-francisco": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/San_Francisco_Downtown_Aerial%2C_August_2025.jpg/800px-San_Francisco_Downtown_Aerial%2C_August_2025.jpg",
  "san-jose": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Valencia_Hotel%2C_Santana_Row_%28cropped%29.jpg/800px-Valencia_Hotel%2C_Santana_Row_%28cropped%29.jpg",
  "los-angeles": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Hollywood_Sign_%28Zuschnitt%29.jpg/800px-Hollywood_Sign_%28Zuschnitt%29.jpg",
  "san-diego": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/La_Jolla_Shores_view_%28cropped%29.jpg/800px-La_Jolla_Shores_view_%28cropped%29.jpg",
  "sacramento": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Sacramento%2C_CA_skyline_%28cropped%29.jpg/800px-Sacramento%2C_CA_skyline_%28cropped%29.jpg",
  "phoenix": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Downtown_Phoenix_Aerial_Looking_Northeast.jpg/800px-Downtown_Phoenix_Aerial_Looking_Northeast.jpg",
  "mesa": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Mesa_Arts_Center_-_West_-_2009-09-16.JPG/800px-Mesa_Arts_Center_-_West_-_2009-09-16.JPG",
  "tempe": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/231029-1_Hayden_Flour_Mill.jpg/800px-231029-1_Hayden_Flour_Mill.jpg",
  "chandler": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Neighborhoods_in_the_City_of_Chandler.jpg/800px-Neighborhoods_in_the_City_of_Chandler.jpg",
  "gilbert": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Gilbert-Gilbert_Heritage_District_as_viewed_from_Gilbert_Rd..jpg/800px-Gilbert-Gilbert_Heritage_District_as_viewed_from_Gilbert_Rd..jpg",
  "scottsdale": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Scottsdale_waterfront.jpg/800px-Scottsdale_waterfront.jpg",
  "tucson": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/View_of_Tucson_from_Sentinel_Peak_2.jpg/800px-View_of_Tucson_from_Sentinel_Peak_2.jpg",
  "las-vegas": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Las_Vegas_from_above_%2840064746644%29.jpg/800px-Las_Vegas_from_above_%2840064746644%29.jpg",
  "denver": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Denver_Downtown_Aerial%2C_December_2025.jpg/800px-Denver_Downtown_Aerial%2C_December_2025.jpg",
  "salt-lake-city": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Salt_Lake_Union_Pacific_Railroad_Station%2C_South_Temple_at_400_West%2C_Central_City_West%2C_Salt_Lake_City%2C_UT%2C_USA.jpg/800px-Salt_Lake_Union_Pacific_Railroad_Station%2C_South_Temple_at_400_West%2C_Central_City_West%2C_Salt_Lake_City%2C_UT%2C_USA.jpg",
  "albuquerque": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Albuquerque%2C_New_Mexico_skyline.jpg/800px-Albuquerque%2C_New_Mexico_skyline.jpg",
  "washington-dc": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/12-07-13-washington-by-RalfR-08.jpg/800px-12-07-13-washington-by-RalfR-08.jpg",
  "arlington": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Rosslyn_Skyline_from_Theodore_Roosevelt_Bridge.png/800px-Rosslyn_Skyline_from_Theodore_Roosevelt_Bridge.png",
  "alexandria": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Old_Town_Alexandria_from_George_Washington_Masonic_National_Memorial.jpg/800px-Old_Town_Alexandria_from_George_Washington_Masonic_National_Memorial.jpg",
  "silver-spring": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Silver_Spring_Montage.jpg/800px-Silver_Spring_Montage.jpg",
  "new-york": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu_%28cropped%29.jpg/800px-View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu_%28cropped%29.jpg",
  "boston": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/ISH_WC_Boston4.jpg/800px-ISH_WC_Boston4.jpg",
  "philadelphia": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Philadelphia_skyline_20240528_%28cropped_2-1%29.jpg/800px-Philadelphia_skyline_20240528_%28cropped_2-1%29.jpg",
  "miami": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Villa_Vizcaya_20110228.jpg/800px-Villa_Vizcaya_20110228.jpg",
  "orlando": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Lake-eola-park-orlando-florida.jpg/800px-Lake-eola-park-orlando-florida.jpg",
  "tampa": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Downtown_Tampa%2C_Florida.jpg/800px-Downtown_Tampa%2C_Florida.jpg",
  "jacksonville": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Jacksonville_skyline.jpg/800px-Jacksonville_skyline.jpg",
  "charlotte": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Uptown_Charlotte_2018_taking_by_DJI_Phantom_4_pro.jpg/800px-Uptown_Charlotte_2018_taking_by_DJI_Phantom_4_pro.jpg",
  "raleigh": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Raleigh_Skyline.jpg/800px-Raleigh_Skyline.jpg",
  "atlanta": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/A2ATL20250614-0721_%28cropped%29.jpg/800px-A2ATL20250614-0721_%28cropped%29.jpg",
  "nashville": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Nashville%2C_TN_skyline.jpg/800px-Nashville%2C_TN_skyline.jpg",
  "chicago": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Chicago_River_ferry_b.jpg/800px-Chicago_River_ferry_b.jpg",
  "minneapolis": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Minneapolis_Skyline_looking_south.jpg/800px-Minneapolis_Skyline_looking_south.jpg",
  "detroit": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Detroit_Skyline_from_Windsor_2025-09-01.jpg/800px-Detroit_Skyline_from_Windsor_2025-09-01.jpg",
  "columbus": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Downtown_Columbus_View_from_Main_St_Bridge_-_edit1.jpg/800px-Downtown_Columbus_View_from_Main_St_Bridge_-_edit1.jpg",
  "indianapolis": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Indianapolis-1872528.jpg/800px-Indianapolis-1872528.jpg",
  "kansas-city": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Kansas_City_-_Downtown_-_panoramio_%2815%29.jpg/800px-Kansas_City_-_Downtown_-_panoramio_%2815%29.jpg",
  "st-louis": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Runner_Fountain_and_Old_Courthouse_and_Arch_%285618845531%29.jpg/800px-Runner_Fountain_and_Old_Courthouse_and_Arch_%285618845531%29.jpg"
};

function CityImage({ cityName, cityCode }: { cityName: string; cityCode: string }) {
  if (!cityName || !cityCode) {
    return <div className="w-full h-full bg-surface-container-highest animate-pulse" />;
  }

  const imgUrl = CITY_IMAGES[cityCode];

  // Fallback map styling if undefined locally securely
  if (!imgUrl) {
    return <div className="w-full h-full bg-surface-container-highest animate-pulse" />;
  }

  // Wrap Wikimedia URLs with weserv proxy to bypass browser ORB (Opaque Response Blocking) and CORS restrictions
  const proxiedUrl = `https://images.weserv.nl/?url=${encodeURIComponent(imgUrl)}&w=800`;

  return (
    <img 
      alt={cityName}
      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
      src={proxiedUrl} 
      crossOrigin="anonymous"
      referrerPolicy="no-referrer"
    />
  );
}

export default function ComparisonView() {
  const { markets } = useAppContext();
  const [leftCode, setLeftCode] = useState('austin');
  const [rightCode, setRightCode] = useState('dallas');

  const leftData = useComparisonData(leftCode);
  const rightData = useComparisonData(rightCode);

  return (
    <div className="bg-background font-body w-full h-[calc(100vh-64px)] overflow-y-auto text-on-surface selection:bg-primary/30 selection:text-primary pb-20">
      <div className="max-w-7xl mx-auto px-8 py-10">
        
        {/* Header */}
        <div className="mb-12 flex justify-between items-end">
          <div className="max-w-2xl">
            <span className="font-label text-xs tracking-widest text-primary font-bold uppercase mb-2 block">
              Analytical Lens
            </span>
            <h1 className="text-4xl font-headline font-extrabold text-on-surface tracking-tighter mb-2">
              Market Comparison
            </h1>
            <p className="text-on-surface-variant font-body text-lg max-w-lg">
              Side-by-side performance audit powered by live FRED and HUD feeds.
            </p>
          </div>
          <div className="flex gap-4">
             <Link to="/" className="px-4 py-2 rounded-lg bg-surface-container-high border border-outline-variant/15 text-on-surface text-sm font-medium hover:bg-surface-container-highest transition-all flex items-center gap-2">
               <span className="material-symbols-outlined text-sm">arrow_back</span>
               Back to Dashboard
             </Link>
          </div>
        </div>

        {/* Market Selectors Wrapper */}
        <div className="glass-panel p-6 rounded-3xl border border-outline-variant/10 shadow-xl mb-12 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="flex-1 w-full relative z-10">
            <label className="block text-xs font-label text-outline uppercase tracking-widest mb-2 font-bold ml-1">Market Alpha</label>
            <div className="relative">
              <select
                className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl py-3 pl-4 pr-10 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/50 appearance-none shadow-sm font-headline font-bold text-lg cursor-pointer transition-colors"
                value={leftCode}
                onChange={(e) => setLeftCode(e.target.value)}
              >
                <option value="">Select market...</option>
                {markets.map((m) => (
                  <option key={m.code} value={m.code}>
                    {m.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-primary">
                <span className="material-symbols-outlined">expand_more</span>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border border-outline-variant/20 shadow-[0_0_20px_rgba(129,236,255,0.05)] bg-surface-container-highest z-10 relative mt-6 md:mt-0">
            <span className="text-primary font-headline font-black text-xs tracking-widest">VS</span>
          </div>

          <div className="flex-1 w-full relative z-10">
            <label className="block text-xs font-label text-outline uppercase tracking-widest mb-2 font-bold ml-1">Market Beta</label>
            <div className="relative">
              <select
                className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl py-3 pl-4 pr-10 text-on-surface focus:outline-none focus:ring-1 focus:ring-tertiary/50 appearance-none shadow-sm font-headline font-bold text-lg cursor-pointer transition-colors"
                value={rightCode}
                onChange={(e) => setRightCode(e.target.value)}
              >
                <option value="">Select market...</option>
                {markets.map((m) => (
                  <option key={m.code} value={m.code}>
                    {m.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-tertiary">
                <span className="material-symbols-outlined">expand_more</span>
              </div>
            </div>
          </div>
        </div>

        {/* The Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative animate-fade-in-up">
          {/* Central VS Divider (Visual Only) */}
          <div className="hidden lg:flex absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-[1px] bg-gradient-to-b from-transparent via-outline-variant/20 to-transparent items-center justify-center z-10 pointer-events-none">
            <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center border border-outline-variant/30 text-outline-variant text-[10px] font-bold"></div>
          </div>

          {/* Left Column */}
          {leftCode ? (
            <MarketColumn 
              data={leftData} 
              colorScheme="primary" 
              labelName="Market Alpha"
              cityCode={leftCode}
            />
          ) : (
            <div className="h-full flex items-center justify-center border border-dashed border-outline-variant/20 rounded-3xl p-12 text-center text-outline-variant font-label text-sm uppercase tracking-widest">
              Please Select Market Alpha
            </div>
          )}

          {/* Right Column */}
          {rightCode ? (
            <MarketColumn 
              data={rightData} 
              colorScheme="tertiary" 
              labelName="Market Beta"
              cityCode={rightCode}
            />
          ) : (
             <div className="h-full flex items-center justify-center border border-dashed border-outline-variant/20 rounded-3xl p-12 text-center text-outline-variant font-label text-sm uppercase tracking-widest">
              Please Select Market Beta
            </div>
          )}
        </div>

        {/* Detailed Comparison Footnote */}
        <div className="mt-16 bg-gradient-to-r from-[rgba(129,236,255,0.05)] to-[rgba(166,140,255,0.05)] p-8 rounded-3xl border border-outline-variant/10 flex items-center justify-between animate-fade-in-up">
          <div className="flex gap-4 items-center">
            <span className="material-symbols-outlined text-primary text-3xl">verified</span>
            <div>
              <h4 className="font-headline font-bold text-lg text-on-surface">Data Transparency Statement</h4>
              <p className="text-on-surface-variant text-sm mt-1 max-w-3xl leading-relaxed">
                All values above represent precise macro-economic data harvested from the Federal Reserve Economic Data (FRED) API and the HUD Fair Market Rent surveys.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
