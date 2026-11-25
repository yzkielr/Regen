import {redirect} from 'next/navigation';
import {currentAdmin} from '@/lib/admin-gateway';
import FileViewer from '../ui/file-viewer';
export const dynamic='force-dynamic';
export default async function FilesPage({searchParams}:{searchParams:Promise<{id?:string;source?:string}>}){
 if(!await currentAdmin())redirect('/admin/login');const query=await searchParams;
 return <FileViewer id={query.id||''} source={query.source||''}/>;
}
