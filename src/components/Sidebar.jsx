import { IoAddCircleOutline, IoArrowForward  } from "react-icons/io5";
import { LuClipboardList } from "react-icons/lu";
import dashboardSidebar from '../assets/dashboardSidebar.svg';
import arrowHide from '../assets/arrowHide.svg';
export default function Sidebar({isOpen}){

    return(
        <aside>
            <IoAddCircleOutline onClick={isOpen} size={'3rem'} color={'#8B949E'} className="sidebarIcons" />
            <LuClipboardList size={'3rem'} color={'#8B949E'} className="sidebarIcons" />
            <IoArrowForward size={'3rem'} color={'#8B949E'} className="arrow" />
        </aside>
    )
}