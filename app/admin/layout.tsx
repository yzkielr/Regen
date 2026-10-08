import type { Metadata, Viewport } from 'next';
import './admin-ui.css';
import './login.css';
export const viewport: Viewport = { width:'device-width',initialScale:1,maximumScale:5,viewportFit:'cover',interactiveWidget:'resizes-content' };
export const metadata: Metadata = { title: 'Regen Admin', description: 'Dashboard internal Regen.', robots: { index:false,follow:false }, openGraph: { title:'Regen Admin',description:'Dashboard internal Regen.' } };
export default function AdminLayout({children}:{children:React.ReactNode}) { return <div className="regen-admin">{children}</div>; }
