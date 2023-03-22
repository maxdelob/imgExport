/*
*  Power BI Visual CLI
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved.
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ""Software""), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/
"use strict";

import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import "./../style/visual.less";
import { select as d3Select } from "d3-selection";


import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;

import { VisualFormattingSettingsModel } from "./settings";

export class Visual implements IVisual {
    private target: HTMLElement;
    private updateCount: number;
    private textNode: Text;
    private formattingSettings: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;

    constructor(options: VisualConstructorOptions) {
        d3Select(options.element)
        .append("div")
        .attr("id", "container")
        this.target = document.getElementById("container");
    }

    public update(options: VisualUpdateOptions) {
        try {
        
            d3Select(this.target).selectAll("div").remove();
            let dataView: any = options.dataViews[0];
            
            const indexUrl = Math.max(...dataView.table.columns.map(e => { if (e.displayName == "url") { return e.index } else { return null } }))
            const indexAsset = Math.max(...dataView.table.columns.map(e => { if (e.displayName == "First ASSET_CODE") { return e.index } else { return null } }))
            const indexTitle = Math.max(...dataView.table.columns.map(e => { if (e.displayName == "First title") { return e.index } else { return null } }))

            const height = options.viewport.height;
            const width = options.viewport.width;
            const imgArray = [];

            const unique_assets = this.getUniqueAsset(dataView, indexAsset);            
            dataView.table.rows = this.filterAssetIfMultiple(dataView,indexAsset,unique_assets);

            dataView.table.rows.forEach(row => { imgArray.push(row[indexUrl]);});
            let lineNumber = 1;
            if (imgArray.length > 1) { lineNumber = imgArray.length;}            
            const mapHeight = height / lineNumber;
            imgArray.forEach((img,i) => {
                d3Select(this.target)
                    .append("div")
                    .attr("id", "row_id_" + i)
                    .attr("class", "row")
                    .style("width", width - 5 + "px")
                    .style("margin-right", "5px")
                    .style("margin-bottom", "5px")

                const row  = document.getElementById("row_id_" + i);

                d3Select(row)
                    .append("img")
                    .attr('crossorigin', 'anonymous')
                    .attr("src", img)    
                            
                const title: any = dataView.table.rows[i][indexTitle]
                d3Select(row)
                    .append("div")
                    .attr("id", "title_id_" + i)
                    .attr("class", "title")
                    .text(title)

            })
               
    
        } catch (e) {
            console.log(e);
        }
    }

    private getUniqueAsset(dataView, indexAsset)   {
        const assets = {};
        dataView.table.rows.forEach(row => {             
            assets[row[indexAsset]] = row[indexAsset]; 
        });
        return Object.keys(assets);
    }
    private filterAssetIfMultiple(dataView, indexAsset, unique_assets) {
        let arr = dataView.table.rows
        if(unique_assets.length > 1) {
            arr = dataView.table.rows.filter(row => {
                if (row[indexAsset] === unique_assets[0]) {
                    return row;
                }
            })
        } 
        return arr;
    }

    /**
     * Returns properties pane formatting model content hierarchies, properties and latest formatting values, Then populate properties pane.
     * This method is called once every time we open properties pane or when the user edit any format property. 
     */
    // public getFormattingModel(): powerbi.visuals.FormattingModel {
    //     return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    // }
}