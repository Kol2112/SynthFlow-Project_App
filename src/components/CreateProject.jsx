import '../styles/CreateProject.css'
export default function CreateProject(){
    return(
            <form action="" className='createProject'>
                <div className="leftColumn">
                    <label htmlFor="">Project Name</label>
                    <input type="text" placeholder='e.g SynthFlow'/>
                    <label htmlFor="" >Project Key</label>
                    <input id='projKey' type="text" placeholder='SNF-50'/>
                    <label htmlFor="">Details</label>
                    <textarea name="" id="" rows= {"10"} cols={"30"}></textarea>
                </div>
                <span id="halfLine"></span>
                <div className="rightColumn">
                    <label htmlFor="">Deadline date</label>
                    <input type='date' name="" id=""/>
                    <label htmlFor="">Add members</label>
                    <p>Users</p>
                    <label htmlFor="">Project priority</label>
                    <div className="projectPriorityButtons">
                        <button className='buttonActive'>Low</button>
                        <button>Medium</button>
                        <button>High</button>
                        <button>Critical</button>
                    </div>
                    <label htmlFor="">Tags</label>
                    <input type="text" name="" id="" placeholder="Please seperate tags with ;"/>
                </div>


            </form>
    )
}