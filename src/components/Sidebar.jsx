import addCircle from '../assets/addCircle.svg'
import dashboardSidebar from '../assets/dashboardSidebar.svg'
import arrowHide from '../assets/arrowHide.svg'
export default function Sidebar(){
    return(
        <aside>
            <img src={addCircle} alt="" />
            <img src={dashboardSidebar} alt="" />
            <img src={arrowHide} alt="" className='arrow' />
        </aside>
    )
}