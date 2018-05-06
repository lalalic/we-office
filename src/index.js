import "./index.less"
import React from "react"
import {QiliApp} from "qili-app"

import {DefaultOffice, Ribbon} from "we-edit/office"
import "we-edit/input-docx"
import "we-edit/representation-pagination"
import "we-edit/representation-html"
import "we-edit/representation-text"
import "we-edit/loader-stream-browser"

import WeOffice from "./we-office"

QiliApp.render(
    <WeOffice>
        <DefaultOffice
            titleBarProps={{
                title:"we-office",
                children:(<span>Raymond</span>)
            }}
            />
    </WeOffice>
)
