import "./index.less"
import React from "react"
import {QiliApp} from "qili-app"
import WeOffice from "./we-office"
import {DefaultOffice, Ribbon} from "we-edit-office"

import "we-edit-input-docx"
import "we-edit-representation-pagination"
import "we-edit-representation-html"
import "we-edit-representation-text"
import "we-edit-loader-stream-browser"

QiliApp.render(<WeOffice>{<DefaultOffice/>}</WeOffice>)
