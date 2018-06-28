import React from "react"
import PropTypes from "prop-types"
import {compose,getContext,withProps} from "recompose"
import {Account} from "qili-app"

import {ListItem} from "material-ui"
import IconAdd from "material-ui/svg-icons/content/add-circle-outline"
import IconItem from "material-ui/svg-icons/hardware/keyboard-arrow-right"


export default compose(
    getContext({router:PropTypes.object}),
    withProps(({user,router})=>({
        children: ([
            <ListItem
                primaryText="My Office" key="office"
                initiallyOpen={false}
                insetChildren={true}
                nestedItems={
                    user.extensions.map(a=><ListItem
                            leftIcon={<span/>}
                            rightIcon={<IconItem/>}
                            onClick={()=>router.push(`/market/${a.id}`)}
                            primaryText={`${a.name}/${a.version}`} key={a.id}/>)
                }
            />,
            user.isDeveloper && <ListItem
                primaryText="My Plugins" key="plugins"
                leftIcon={<span />}
                initiallyOpen={false}
                insetChildren={true}
                nestedItems={
                    user.plugins.map(a=><ListItem
                            leftIcon={<span/>}
                            rightIcon={<IconItem/>}
                            onClick={()=>router.push(`/market/${a.id}`)}
                            primaryText={a.name} key={a.id}/>)
                }
            />
        ]),
        toSetting: ()=>router.push('/my/setting'),
        toProfile: ()=>router.push('/my/profile')
    })),
)(Account)
