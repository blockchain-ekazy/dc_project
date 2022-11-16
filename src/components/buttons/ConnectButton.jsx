import './buttons.css'

const ConnectButton = (props) => {
    if(props.connected){
        return(
            <></>
        )   
    }else{
        return(
            <div className="connectWrap">
                <button className="connectBtn" onClick={props.connect}>Connect to Metamask</button>
            </div>
        )
    }
}
export default ConnectButton
