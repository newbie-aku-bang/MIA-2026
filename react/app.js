/* AksiWarga - React 18 (UMD, tanpa build step & tanpa JSX supaya bisa dibuka langsung dari file) */
const { useState, useEffect, useRef, Fragment, createElement: h } = React;

/* ===== DATA ===== */
const ISLAND_LINKS = [
    { label: 'Laporan', target: 'laporan' },
    { label: 'Peta', target: 'peta' },
    { label: 'Statistik', target: 'statistik' },
    { label: 'FAQ', target: 'faq' },
];

/* Isi dropdown: teks contoh, ganti sesuai kebutuhan */
const MENU_LINKS = [
    ['Beranda', '#beranda'],
    ['Peta Laporan', '#peta'],
    ['Kabar Progres', '#'],
    ['Statistik Kinerja', '#statistik'],
];

/* corner = sudut kotak yang menghadap titik tengah blok */
const STATS = [
    { label: 'Total Laporan Masuk', value: '1.405', strong: '+12 hari ini', note: ' dari seluruh wilayah', corner: 'br' },
    { label: 'Berhasil Diselesaikan', value: '1.405', strong: '89%', note: ' tingkat penyelesaian total', corner: 'bl', valueColor: '#15803d' },
    { label: 'Rata-rata Respon', value: '1.405', note: 'Waktu tanggap awal oleh instansi', corner: 'tr' },
    { label: 'Belum Ditanggapi', value: '1.405', strong: 'Melewati batas SLA', note: ' (transparan)', corner: 'tl', valueColor: '#dc2626' },
];

/* ===== HOOK: apakah header sedang berada di atas section terang? ===== */
function useOnLight() {
    const [light, setLight] = useState(false);
    useEffect(() => {
        const check = () => setLight([...document.querySelectorAll('[data-light]')].some((el) => {
            const r = el.getBoundingClientRect();
            return r.top <= 40 && r.bottom > 40;
        }));
        check();
        window.addEventListener('scroll', check, { passive: true });
        window.addEventListener('resize', check);
        return () => { window.removeEventListener('scroll', check); window.removeEventListener('resize', check); };
    }, []);
    return light;
}

function useAfterHero() {
    const [afterHero, setAfterHero] = useState(false);
    useEffect(() => {
        const check = () => {
            const hero = document.getElementById('beranda');
            setAfterHero(Boolean(hero && hero.getBoundingClientRect().bottom <= 0));
        };
        check();
        window.addEventListener('scroll', check, { passive: true });
        window.addEventListener('resize', check);
        return () => { window.removeEventListener('scroll', check); window.removeEventListener('resize', check); };
    }, []);
    return afterHero;
}

/* ===== HEADER: logo kiri, (sign in/up) + menu kanan ===== */
function Header({ open, light, afterHero, setOpen }) {
    return h('header', { className: 'site-header', 'data-light': String(light && !open), 'data-after-hero': String(afterHero && !open), 'data-menu': String(open) },
        h('a', { href: '#beranda', className: 'brand', onClick: () => setOpen(false) },
            h('span', { className: 'tile' }, h('img', { src: '../asset/logo%20web.jpg', alt: 'Logo AksiWarga' })),
            h('span', { className: 'brand-name' }, 'AksiWarga')),
        h('div', { className: 'header-right' },
            h('div', { className: 'auth' },
                h('a', { href: '#', className: 'auth-in' }, 'Sign in'),
                h('a', { href: '#', className: 'auth-up' }, 'Sign up')),
            h('button', {
                type: 'button', className: 'menu-btn', 'aria-expanded': open, 'aria-controls': 'menu-panel',
                'aria-label': open ? 'Tutup menu' : 'Buka menu', onClick: () => setOpen(!open),
            },
                h('span', { className: 'menu-label' }, open ? 'Tutup' : 'Menu'),
                h('span', { className: 'tile burger', 'aria-hidden': 'true' }, h('i'), h('i')))));
}

/* ===== DYNAMIC ISLAND: bulat -> 4 pilihan saat hover (tap di layar sentuh) ===== */
function Island({ onNavigate }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const outside = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
        document.addEventListener('pointerdown', outside);
        return () => document.removeEventListener('pointerdown', outside);
    }, []);

    const hover = (value) => (e) => e.pointerType === 'mouse' && setOpen(value);

    return h('nav', { ref, className: 'island', 'aria-label': 'Navigasi cepat', 'data-open': String(open), onPointerEnter: hover(true), onPointerLeave: hover(false) },
        h('button', { type: 'button', className: 'island-dots', 'aria-label': 'Buka navigasi cepat', onClick: () => setOpen(true) }, h('i'), h('i'), h('i'), h('i')),
        h('ul', { className: 'island-links' }, ISLAND_LINKS.map((l) =>
            h('li', { key: l.target },
                h('a', { href: '#' + l.target, onClick: (e) => { e.currentTarget.blur(); setOpen(false); onNavigate(); } }, l.label)))));
}

/* ===== DROPDOWN MENU ===== */
function MenuPanel({ open, setOpen }) {
    const close = () => setOpen(false);
    return h('div', { id: 'menu-panel', className: 'menu-panel', 'data-open': String(open), inert: open ? undefined : '' },
        h('ul', { className: 'menu-list' }, MENU_LINKS.map(([label, href], i) =>
            h('li', { key: label, className: 'menu-item', style: { '--i': i } },
                h('a', { href, className: 'menu-link', onClick: close }, label)))),
        h('div', { className: 'menu-item menu-foot', style: { '--i': 4 } },
            h('p', null, 'Contoh teks tambahan. Bagian ini nanti diganti sesuai kebutuhan.'),
            h('a', { href: '#laporan', className: 'menu-cta', onClick: close }, 'Buat Laporan')));
}

/* ===== HERO (background tidak diubah) ===== */
function Hero() {
    const btn = 'w-full rounded-full px-7 py-3.5 text-center text-sm font-medium transition sm:w-auto';
    return h('section', { id: 'beranda', className: 'relative flex min-h-screen items-center justify-center overflow-hidden' },
        h('div', { className: 'absolute inset-0 z-0 bg-cover bg-center', style: { backgroundImage: "url('../asset/all%20in%20one.jpg')" } }),
        h('div', { className: 'absolute inset-0 z-0 bg-slate-950/60' }),
        h('div', { className: 'relative z-10 mx-auto max-w-4xl px-6 py-28 text-center' },
            h('h1', { className: 'text-5xl font-semibold leading-[1.02] tracking-[-0.035em] text-white sm:text-6xl md:text-7xl lg:text-8xl' },
                'Tak Ada Lagi Masalah yang Tersembunyi.'),
            h('p', { className: 'mx-auto mt-8 max-w-xl text-base leading-relaxed text-white/80 md:text-lg' },
                'Mulai dari tumpukan sampah hingga antrean bansos—kini warga bisa mengawasi kinerja pelayanan publik tanpa batasan birokrasi.'),
            h('div', { className: 'mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row' },
                h('a', { href: '#peta', className: btn + ' bg-white text-ink hover:bg-white/85' }, 'Lihat Peta'),
                h('a', { href: '#laporan', className: btn + ' border border-white/50 text-white hover:bg-white/10' }, 'Laporkan Masalah'))));
}

/* ===== KOTAK DATA: outline dihitung dari ukuran kotak ===== */
const GAP = 7, EDGE = 1; /* GAP: garis ke titik tengah, EDGE: garis ke sisi luar */

function Stat({ label, value, strong, note, corner, valueColor }) {
    const cell = useRef(null);
    const path = useRef(null);

    useEffect(() => {
        const fit = () => {
            const w = cell.current.offsetWidth, ht = cell.current.offsetHeight;
            const ix = corner.includes('r') ? w - GAP : GAP,  ox = corner.includes('r') ? EDGE : w - EDGE;
            const iy = corner.includes('b') ? ht - GAP : GAP, oy = corner.includes('b') ? EDGE : ht - EDGE;
            path.current.setAttribute('d', `M${ix} ${iy}H${ox}V${oy}H${ix}Z`); /* mulai dari siku "L" */
            path.current.style.setProperty('--len', path.current.getTotalLength());
        };
        const ro = new ResizeObserver(fit);
        ro.observe(cell.current);
        return () => ro.disconnect();
    }, [corner]);

    return h('button', {
        ref: cell, type: 'button', 'data-corner': corner, className: 'stat flex flex-col items-center justify-center p-5 text-center sm:p-8 md:p-12',
    },
        h('svg', { 'aria-hidden': 'true' }, h('path', { ref: path })),
        h('p', { className: 'text-xs font-medium text-muted sm:text-sm' }, label),
        h('p', { className: 'mt-3 text-4xl font-semibold tracking-[-0.04em] tabular-nums sm:text-5xl md:text-6xl', style: valueColor ? { color: valueColor } : undefined }, value),
        h('p', { className: 'mt-3 text-xs leading-relaxed text-muted' },
            strong && h('span', { className: 'font-medium text-ink' }, strong), note));
}

function Stats() {
    return h('section', { id: 'laporan', 'data-light': '', className: 'flex min-h-screen items-center justify-center bg-paper px-6 py-20' },
        h('div', { className: 'mx-auto w-full max-w-4xl' },
            h('div', { className: 'stats-heading mb-10 text-left' },
                h('h2', { className: 'text-4xl font-semibold tracking-[-0.035em] md:text-5xl' }, 'Rekam Jejak Pengaduan'),
                h('p', { className: 'mt-4 max-w-2xl text-muted' }, 'Sejauh mana suara warga didengar dan ditindaklanjuti oleh pihak berwenang.')),
            h('div', { className: 'grid grid-cols-2' }, STATS.map((s) => h(Stat, { key: s.label, ...s }))), h(Actions)));
}

/* ===== IKON (inline SVG, ikut warna teks) ===== */
const pth = (d) => h('path', { d });
const ICONS = {
    plus: [pth('M12 5v14M5 12h14')],
    clock: [h('circle', { cx: 12, cy: 12, r: 9 }), pth('M12 7v5l3 2')],
    link: [pth('M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5')],
    pin: [pth('M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z'), h('circle', { cx: 12, cy: 10, r: 2.5 })],
    down: [pth('M7 7l10 10M17 8v9H8')],
};
function Icon({ name }) {
    return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true' }, ...ICONS[name]);
}
const Pie = () => h('svg', { viewBox: '0 0 24 24', fill: 'currentColor', 'aria-hidden': 'true' }, pth('M12 12l9.2 3.9A10 10 0 1 1 8 2.8z'), pth('M13.5 10.5V2.1A10 10 0 0 1 22 10.5z'));

function Heading({ title, sub }) {
    return h('div', { className: 'mb-10 text-left' },
        h('h2', { className: 'text-4xl font-semibold tracking-[-0.035em] md:text-5xl' }, title),
        h('p', { className: 'mt-4 max-w-2xl text-muted md:text-lg' }, sub));
}

/* ===== REKAM JEJAK: tombol Pengaduan Baru & Status Laporan ===== */
const ACTIONS = [
    { icon: 'plus', title: 'Pengaduan Baru', desc: 'Laporkan masalah atau keluhan Anda untuk ditindaklanjuti.' },
    { icon: 'clock', title: 'Status Laporan', desc: 'Pantau perkembangan laporan Anda dari masuk hingga selesai.' },
];
function Actions() {
    return h('div', { className: 'actions bleed' }, ACTIONS.map((a) => h('button', { key: a.title, type: 'button', className: 'action' },
        h('span', { className: 'action-head' }, h('span', { className: 'action-ico' }, h(Icon, { name: a.icon })), h('strong', null, a.title)),
        h('span', { className: 'action-desc' }, a.desc))));
}

/* ===== PETA: tempat peta saja (peta dipasang di #peta-indonesia nanti) ===== */
const LEGEND = [['var(--map)', '>50% Laporan diselesaikan'], ['#f59e0b', '>50% Laporan diproses'], ['#ef4444', '>50% Laporan belum ditanggapi']];
function Peta() {
    return h('section', { id: 'peta', 'data-light': '', className: 'section' },
        h('div', { className: 'wide' },
            h(Heading, { title: 'Lihat Lebih Luas', sub: 'Pantau daerahmu disini.' }),
            h('div', { className: 'map-bar' },
                h('p', { className: 'map-hint' }, h('i'), 'Arahkan kursor ke provinsi untuk melihat ringkasan pengaduan.'),
                h('button', { type: 'button', className: 'chip' }, h(Icon, { name: 'link' }), 'Lihat Detail')),
            h('div', { id: 'peta-indonesia', className: 'map-shape', role: 'img', 'aria-label': 'Area peta Indonesia' }, h('span', null, 'Area peta Indonesia')),
            h('div', { className: 'map-foot' },
                h('button', { type: 'button', className: 'card here' }, h('span', { className: 'here-ico' }, h(Icon, { name: 'pin' })), 'Lihat daerah saya'),
                h('ul', { className: 'card legend' }, LEGEND.map(([c, t]) => h('li', { key: t }, h('i', { style: { background: c } }), t))))));
}

/* ===== STATISTIK KINERJA: data (ganti sesuai data asli) ===== */
const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const SERIES = [['selesai', '#16803c', 'Laporan diselesaikan'], ['masuk', '#3158e8', 'Laporan masuk']];
const TREND = { /* tambah tahun baru cukup dengan menambah baris di sini */
    2026: { masuk: [40, 20, 50, 11, 44, 24, 69, 10, 50, 34], selesai: [18, 28, 21, 46, 35, 61, 54, 58, 68, 92] },
    2025: { masuk: [22, 30, 26, 38, 41, 35, 48, 52, 44, 50, 46, 58], selesai: [15, 24, 22, 31, 35, 30, 42, 47, 40, 46, 43, 54] },
    2024: { masuk: [12, 18, 15, 24, 28, 22, 30, 33, 29, 35, 31, 38], selesai: [8, 13, 12, 19, 22, 18, 25, 28, 25, 30, 27, 33] },
};
const YEARS = Object.keys(TREND).map(Number).reverse();
const RATIO = [['#16803c', 45, 'Selesai'], ['#ca8a04', 35, 'Proses'], ['#dc2626', 20, 'Overdue']];
const RANKING = [
    ['Dinas Bina Marga', 'Infrastruktur', 440, '94%', '1.2 Hari'],
    ['Dinas Lingkungan Hidup', 'Kebersihan', 386, '88%', '1.4 Hari'],
    ['Dinas Sosial', 'Bantuan Sosial (Bansos)', 350, '82%', '2.1 Hari'],
    ['Dinas Perhubungan', 'Keselamatan Umum', 280, '78%', '2.4 Hari'],
];
const CATEGORIES = [['Infrastruktur & Jalan', 45], ['Lingkungan & Sampah', 25], ['Bantuan Sosial (Bansos)', 16], ['Fasilitas Umum & Lainnya', 12]];

/* Garis melengkung halus (Catmull-Rom -> Bezier) */
const smooth = (pts) => pts.map(([px, py], i) => {
    if (!i) return `M${px} ${py}`;
    const a = pts[i - 2] || pts[i - 1], b = pts[i - 1], c = pts[i + 1] || pts[i];
    return `C${b[0] + (px - a[0]) / 6} ${b[1] + (py - a[1]) / 6} ${px - (c[0] - b[0]) / 6} ${py - (c[1] - b[1]) / 6} ${px} ${py}`;
}).join('');

function TrendChart({ year }) {
    const d = TREND[year], n = d.masuk.length;
    const W = 1000, H = 340, L = 50, R = 24, T = 30, B = 56;
    const top = Math.max(100, Math.ceil(Math.max(...d.masuk, ...d.selesai) / 25) * 25);
    const x = (i) => L + (i * (W - L - R)) / (n - 1);
    const y = (v) => T + (H - T - B) * (1 - v / top);
    return h('svg', { className: 'chart', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': `Grafik laporan masuk dan diselesaikan per bulan, tahun ${year}` },
        h('text', { x: 0, y: 12, className: 'ax' }, 'Jumlah Laporan'),
        ...Array.from({ length: top / 25 + 1 }, (_, i) => i * 25).map((t) => h('g', { key: 'y' + t },
            h('line', { x1: L, x2: W - R, y1: y(t), y2: y(t), className: 'grid' }),
            h('text', { x: L - 12, y: y(t) + 4, textAnchor: 'end', className: 'tick' }, t))),
        ...d.masuk.map((_, i) => h('text', { key: 'x' + i, x: x(i), y: H - B + 22, textAnchor: 'middle', className: 'tick' }, MONTHS[i])),
        h('text', { x: (L + W - R) / 2, y: H - 6, textAnchor: 'middle', className: 'ax' }, `Tahun ${year}`),
        ...SERIES.map(([k, c], s) => {
            const other = d[SERIES[1 - s][0]];
            const pts = d[k].map((v, i) => [x(i), y(v)]);
            return h('g', { key: k },
                h('path', { d: smooth(pts), fill: 'none', stroke: c, strokeWidth: 2 }),
                ...pts.map(([px, py], i) => h('g', { key: i },
                    h('circle', { cx: px, cy: py, r: 3.5, fill: c }),
                    h('text', { x: px, y: d[k][i] >= other[i] ? py - 10 : py + 17, textAnchor: 'middle', className: 'val', style: { fill: c } }, d[k][i]))));
        }));
}

function Trend() {
    const [year, setYear] = useState(YEARS[0]);
    const last = TREND[year].masuk.length - 1;
    return h('div', { className: 'card chart-card' },
        h('div', { className: 'chart-head' },
            h('div', null,
                h('h3', { className: 'card-title' }, `Tren Aktivitas Penanganan (${year})`),
                h('p', { className: 'card-sub' }, `Data resmi — perbandingan laporan masuk dan laporan diselesaikan per bulan (${MONTHS[0]}–${MONTHS[last]} ${year}).`),
                h('ul', { className: 'key' }, SERIES.map(([k, c, label]) => h('li', { key: k }, h('i', { style: { background: c } }), label)))),
            h('label', { className: 'year' }, 'Tahun',
                h('select', { value: year, 'aria-label': 'Pilih tahun', onChange: (e) => setYear(Number(e.target.value)) }, YEARS.map((v) => h('option', { key: v, value: v }, v))))),
        h('div', { className: 'chart-scroll' }, h(TrendChart, { key: year, year })));
}

function Ranking() {
    return h('div', { className: 'card rank' },
        h('div', { className: 'rank-head' },
            h('div', null, h('h3', { className: 'card-title' }, 'Peringkat Kerja Instansi'), h('p', { className: 'card-sub' }, 'Data resmi — peringkat instansi berdasarkan kinerja penanganan.')),
            h('div', { className: 'rank-cols' }, ['Total Aduan', 'Penyelesaian', 'AVG respon'].map((c) => h('span', { key: c }, c)))),
        h('ol', { className: 'rank-list' }, RANKING.map(([name, dept, ...v], i) => h('li', { key: name },
            h('b', { className: 'rank-no' }, i + 1),
            h('span', { className: 'rank-name' }, h('strong', null, name), h('small', null, dept)),
            v.map((val) => h('span', { key: val }, val))))));
}

function Categories() {
    return h('div', { className: 'card cats' },
        h('h3', { className: 'card-title' }, 'Kategori Masalah'),
        h('p', { className: 'card-sub' }, 'Tingkat penyelesaian per kategori.'),
        h('ul', null, CATEGORIES.map(([name, v]) => h('li', { key: name },
            h('div', null, h('span', null, name), h('b', null, v + '%')),
            h('div', { className: 'bar' }, h('i', { style: { width: v + '%' } }))))));
}

function Kinerja() {
    return h('section', { id: 'statistik', 'data-light': '', className: 'section' },
        h('div', { className: 'wide' },
            h(Heading, { title: 'Statistik Kinerja & Akuntabilitas', sub: 'Transparansi menyeluruh atas respons instansi dan tren penyelesaian aduan warga.' }),
            h('div', { className: 'kpis' },
                h('article', { className: 'card kpi' },
                    h('header', null, h('h3', { className: 'kpi-label' }, 'Rasio Status Global'), h(Pie)),
                    h('p', { className: 'kpi-value' }, '1.456', h('small', null, 'Total Aduan')),
                    h('p', { className: 'kpi-note' }, 'Proporsi status penanganan laporan saat ini di seluruh wilayah.'),
                    h('div', { className: 'kpi-foot' },
                        h('div', { className: 'ratio' }, RATIO.map(([c, w]) => h('i', { key: c, style: { background: c, flex: w } }))),
                        h('div', { className: 'ratio-key' }, RATIO.map(([c, w, l]) => h('span', { key: l, style: { color: c } }, `${l} (${w}%)`))))),
                h('article', { className: 'card kpi' },
                    h('header', null, h('h3', { className: 'kpi-label' }, 'Kepatuhan SLA Instansi')),
                    h('p', { className: 'kpi-value' }, '91%'),
                    h('p', { className: 'kpi-note' }, 'Sebagian besar instansi merespon aduan warga dalam batas waktu standar (3 hari kerja).'),
                    h('div', { className: 'kpi-foot sla' },
                        h('span', null, 'Tepat Waktu: ', h('strong', null, '1.257 Laporan')),
                        h('span', { className: 'late' }, 'Terlambat: ', h('strong', null, '56 Laporan')))),
                h('article', { className: 'card kpi' },
                    h('header', null, h('h3', { className: 'kpi-label' }, 'Kecepatan Tanggap'), h(Icon, { name: 'clock' })),
                    h('p', { className: 'kpi-value' }, '1.8', h('small', null, 'Hari')),
                    h('p', { className: 'kpi-note' }, 'Waktu rata-rata yang dibutuhkan dinas terkait untuk melakukan verifikasi laporan.'),
                    h('div', { className: 'kpi-foot' }, h('span', { className: 'pill' }, h(Icon, { name: 'down' }), '-0.4 hari dari bulan lalu')))),
            h(Trend),
            h('div', { className: 'rank-row' }, h(Ranking), h(Categories))));
}

/* ===== Halaman sementara supaya navigasi island punya tujuan ===== */
function Page({ id, title }) {
    return h('section', { id, 'data-light': '', className: 'flex min-h-screen items-center justify-center bg-paper px-6 text-center' },
        h('div', { className: 'max-w-md' },
            h('h2', { className: 'text-4xl font-semibold tracking-[-0.035em] md:text-5xl' }, title),
            h('p', { className: 'mt-4 text-muted' }, 'Contoh teks. Isi halaman ini akan diganti nanti.')));
}

/* ===== APP ===== */
function App() {
    const [menuOpen, setMenuOpen] = useState(false);
    const onLight = useOnLight();
    const afterHero = useAfterHero();

    useEffect(() => {
        document.documentElement.style.overflow = menuOpen ? 'hidden' : '';
        const onKey = (e) => e.key === 'Escape' && setMenuOpen(false);
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [menuOpen]);

    return h(Fragment, null,
        h(Header, { open: menuOpen, light: onLight, afterHero, setOpen: setMenuOpen }),
        h(Island, { onNavigate: () => setMenuOpen(false) }),
        h(MenuPanel, { open: menuOpen, setOpen: setMenuOpen }),
        h('main', null,
            h(Hero),
            h(Stats),
            h(Peta),
            h(Kinerja),
            h(Page, { id: 'faq', title: 'FAQ' })));
}

ReactDOM.createRoot(document.getElementById('root')).render(h(App));
