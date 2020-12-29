import "./index.less"
import React from "react"
import {QiliApp} from "qili-app"

import {WeOffice,routes} from "./we-office"

QiliApp.render(<WeOffice debug={true}>{routes}</WeOffice>)
