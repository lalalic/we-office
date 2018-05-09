import "./index.less"
import React from "react"
import {QiliApp} from "qili-app"

import "we-edit/input-docx"
import "we-edit/representation-pagination"
import "we-edit/representation-html"
import "we-edit/representation-text"
import "we-edit/loader-stream-browser"

import {WeOffice,routes} from "./we-office"

QiliApp.render(<WeOffice>{routes}</WeOffice>)
