import React from "react"
import PropTypes from "prop-types"
import {compose,getContext,withProps} from "recompose"
import {Account} from "qili-app"

import {ListItem} from "material-ui"
import IconAdd from "material-ui/svg-icons/content/add-circle-outline"
import IconItem from "material-ui/svg-icons/hardware/keyboard-arrow-right"


export default compose(
    getContext({router:PropTypes.object}),
    withProps(({data:{me},router})=>({
        user:me,
        children: ([
            me.extensions.length!=0 && <ListItem
                primaryText="My Office" key="office"
                initiallyOpen={true}
                insetChildren={true}
                nestedItems={
                    me.extensions.map(a=><ListItem
                            leftIcon={<span/>}
                            rightIcon={<IconItem/>}
                            onClick={()=>router.push(`/market/${a.id}`)}
                            primaryText={a.name} key={a.id}/>)
                }
            />,
            me.plugins.length!=0 && <ListItem
                primaryText="My Plugins" key="plugins"
                leftIcon={<IconAdd/>}
                initiallyOpen={true}
                insetChildren={true}
                onClick={()=>router.push(`/market/create`)}
                nestedItems={
                    me.plugins.map(a=><ListItem
                            leftIcon={<span/>}
                            rightIcon={<IconItem/>}
                            onClick={()=>router.push(`/market/${a.id}`)}
                            primaryText={a.name} key={a.id}/>)
                }
            />,
        ]),
        toSetting: ()=>router.push('/my/setting'),
        toProfile: ()=>router.push('/my/profile')
    })),
)(Account)
