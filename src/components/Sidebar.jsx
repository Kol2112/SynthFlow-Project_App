import { IoAddCircleOutline, IoArrowForward, IoArrowBack} from "react-icons/io5";
import { LuClipboardList } from "react-icons/lu";
import { useState } from "react";
export default function Sidebar({isOpen}){
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    function toggleSidebar(){
        setIsSidebarOpen(!isSidebarOpen);
    }
    return(
        <aside className={` ${isSidebarOpen ? 'open' : 'collapse'}`}>
            <ul>
                <li>
                    <IoAddCircleOutline onClick={isOpen} size={'3rem'} color={'#8B949E'} className="sidebarIcons" />  
                    <p>Add project</p>
                </li>
                <li>
                    <LuClipboardList size={'3rem'} color={'#8B949E'} className="sidebarIcons" />
                    <p>Dashboard</p>
                </li>
            
            </ul>

            {isSidebarOpen ? <IoArrowBack className="arrow" onClick={toggleSidebar} /> : <IoArrowForward className="arrow" onClick={toggleSidebar}/> }
        </aside>
    )
}