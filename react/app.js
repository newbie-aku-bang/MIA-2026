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
    ['Peta Laporan', '#'],
    ['Kabar Progres', '#'],
    ['Statistik Kinerja', '#statistik'],
];

/* corner = sudut kotak yang menghadap titik tengah blok */
const STATS = [
    { label: 'Total Laporan Masuk', value: '1.405', strong: '+12 hari ini', note: ' dari seluruh wilayah', corner: 'br', target: 'laporan-masuk' },
    { label: 'Berhasil Diselesaikan', value: '1.405', strong: '89%', note: ' tingkat penyelesaian total', corner: 'bl', target: 'laporan-selesai', valueColor: '#15803d' },
    { label: 'Rata-rata Respon', value: '1.405', note: 'Waktu tanggap awal oleh instansi', corner: 'tr', target: 'waktu-respon' },
    { label: 'Belum Ditanggapi', value: '1.405', strong: 'Melewati batas SLA', note: ' (transparan)', corner: 'tl', target: 'belum-ditanggapi', valueColor: '#dc2626' },
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
                h('a', { href: '#peta', className: btn + ' bg-white text-ink hover:bg-white/85' }, 'Lihat Peta Transparansi'),
                h('a', { href: '#laporan', className: btn + ' border border-white/50 text-white hover:bg-white/10' }, 'Laporkan Masalah'))));
}

/* ===== KOTAK DATA: outline dihitung dari ukuran kotak ===== */
const GAP = 7, EDGE = 1; /* GAP: garis ke titik tengah, EDGE: garis ke sisi luar */

function Stat({ label, value, strong, note, corner, target, valueColor }) {
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
        onClick: () => { window.location.hash = target; },
    },
        h('svg', { 'aria-hidden': 'true' }, h('path', { ref: path })),
        h('p', { className: 'text-xs font-medium text-muted sm:text-sm' }, label),
        h('p', { className: 'mt-3 text-4xl font-semibold tracking-[-0.04em] tabular-nums sm:text-5xl md:text-6xl', style: valueColor ? { color: valueColor } : undefined }, value),
        h('p', { className: 'mt-3 text-xs leading-relaxed text-muted' },
            strong && h('span', { className: 'font-medium text-ink' }, strong), note));
}

function Stats() {
    return h('section', { id: 'statistik', 'data-light': '', className: 'flex min-h-screen items-center justify-center bg-paper px-6 py-20' },
        h('div', { className: 'mx-auto w-full max-w-4xl' },
            h('div', { className: 'stats-heading mb-10 text-left' },
                h('h2', { className: 'text-4xl font-semibold tracking-[-0.035em] md:text-5xl' }, 'Rekam Jejak Pengaduan'),
                h('p', { className: 'mt-4 max-w-2xl text-muted' }, 'Sejauh mana suara warga didengar dan ditindaklanjuti oleh pihak berwenang.')),
            h('div', { className: 'grid grid-cols-2' }, STATS.map((s) => h(Stat, { key: s.label, ...s })))));
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
            h(Page, { id: 'laporan', title: 'Laporan' }),
            h(Page, { id: 'peta', title: 'Peta' }),
            h(Page, { id: 'faq', title: 'FAQ' }),
            h(Page, { id: 'laporan-masuk', title: 'Total Laporan Masuk' }),
            h(Page, { id: 'laporan-selesai', title: 'Berhasil Diselesaikan' }),
            h(Page, { id: 'waktu-respon', title: 'Rata-rata Respon' }),
            h(Page, { id: 'belum-ditanggapi', title: 'Belum Ditanggapi' })));
}

ReactDOM.createRoot(document.getElementById('root')).render(h(App));
