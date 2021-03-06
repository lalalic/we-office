import React from "react"
import PropTypes from "prop-types"
import {compose,getContext,withProps} from "recompose"
import Account from "qili-app/components/account"

import {ListItem} from "material-ui/List"
import IconItem from "material-ui/svg-icons/hardware/keyboard-arrow-right"

import {withFragment} from "qili-app/graphql"

export default compose(
    getContext({router:PropTypes.object}),
    withFragment({
        user:graphql`
            fragment my_user on User{
                plugins{
                    id
                    name
                }
                extensions{
                    id
                    name
                    version
                }
                isDeveloper
                ...qili_account_user
            }
        `
    }),
    withProps(({user,router, toPlugin})=>({
        children: ([
            <ListItem
                primaryText="My Office" key="office"
                initiallyOpen={false}
                insetChildren={true}
                nestedItems={
                    user.extensions.map(a=><ListItem
                            leftIcon={<span/>}
                            rightIcon={<IconItem/>}
                            onClick={()=>router.push(toPlugin(a.id))}
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
                            onClick={()=>router.push(toPlugin(a.id))}
                            primaryText={a.name} key={a.id}/>)
                }
            />
        ]),
        toSetting: ()=>router.push('/my/setting'),
        toProfile: ()=>router.push('/my/profile')
    })),
)(Account)
