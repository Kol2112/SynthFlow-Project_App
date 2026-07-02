import '../../styles/PriorityDots.css'
export default function PriorityDots({priority}){
    
    const prioritySwitch = () =>{
        switch (priority){
            case "Low": return "isLow";
            case "Medium": return "isMedium";
            case "High": return "isHigh";
            case "Critical": return 'isCritical';
            default: return "isLow"
        }
    }

    return(
        <div className={`priorityItemDots priority-indicator ${prioritySwitch()}`}>
            <span className="prorityDot"></span>
            <span className="prorityDot"></span>
            <span className="prorityDot"></span>
            <span className="prorityDot"></span>
        </div>
    )
}