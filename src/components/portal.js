import {createPortal} from "react-dom"

export default ({children,container})=>createPortal(children, container)