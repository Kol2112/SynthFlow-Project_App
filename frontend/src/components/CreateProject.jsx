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
                    <svg xmlns="http://www.w3.org/2000/svg" height="2rem" viewBox="0 -960 960 960" width="2rem" fill="#8B949E" ><path d="M440-280h80v-160h160v-80H520v-160h-80v160H280v80h160v160Zm40 200q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
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