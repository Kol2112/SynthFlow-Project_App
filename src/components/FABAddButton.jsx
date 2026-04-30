import { IoAddCircleOutline  } from "react-icons/io5";
import '../styles/buttons.css'
export default function FABADDButton({isOpen}){
    return(
        <div id="FABAddButton">
            <IoAddCircleOutline onClick={isOpen}/>
        </div>
    )
}