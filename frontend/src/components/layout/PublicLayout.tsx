import { Outlet } from 'react-router-dom';
import { MiniSidebar } from '../MiniSidebar';
import { PresenceProvider } from '../../utils/presence';
// import { ChatSidebar } from '../ChatSidebar';
// import { ChatWindow } from '../ChatWindow';

export function PublicLayout(){
    return (
        <PresenceProvider>
            <div className='min-h-screen md:h-lvh flex flex-col md:flex-row'>
                <MiniSidebar />
                <Outlet />
            </div>
        </PresenceProvider>
    );
}
