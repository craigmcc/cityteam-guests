// TemplatesServices ---------------------------------------------------------

// Services implementation for Template models.

// External Modules ----------------------------------------------------------

import { FindOptions } from "sequelize";

// Internal Modules ----------------------------------------------------------

import AbstractServices from "./AbstractServices";
import Facility from "../models/Facility";
import Template from "../models/Template";
import { NotFound } from "../util/http-errors";
import { appendPagination } from "../util/query-parameters";
import { TEMPLATE_ORDER } from "../util/sort-orders";

// Public Objects ------------------------------------------------------------

export class TemplateServices extends AbstractServices<Template> {

    // Standard CRUD Methods -------------------------------------------------

    public async all(query?: any): Promise<Template[]> {
        let options: FindOptions = appendQuery({
            order: TEMPLATE_ORDER
        }, query);
        return Template.findAll(options);
    }

    public async find(templateId: number, query?: any): Promise<Template> {
        let options: FindOptions = appendQuery({
            where: { id: templateId }
        }, query);
        let results = await Template.findAll(options);
        if (results.length === 1) {
            return results[0];
        } else {
            throw new NotFound(
                `templateId: Missing Template ${templateId}`,
                "TemplateServices.find()");
        }
    }

    public async insert(template: Template): Promise<Template> {
        try {
            return await Template.create(template, {
                fields: fields,
            });
        } catch (error) {
            throw error;
        }
    }

    public async remove(templateId: number): Promise<Template> {
        let removed = await Template.findByPk(templateId);
        if (!removed) {
            throw new NotFound(
                `templateId: Missing Template ${templateId}`,
                "TemplateServices.remove()");
        }
        let count = await Template.destroy({
            where: { id: templateId }
        });
        if (count < 1) {
            throw new NotFound(
                `templateId: Cannot remove Template ${templateId}`,
                "TemplateServices.remove()");
        }
        return removed;
    }

    public async update(templateId: number, template: Template): Promise<Template> {
        try {
            template.id = templateId;
            let result: [number, Template[]] = await Template.update(template, {
                fields: fieldsWithId,
                where: { id: templateId }
            });
            if (result[0] < 1) {
                throw new NotFound(
                    `templateId: Cannot update Template ${templateId}`,
                    "TemplateServices.update()");
            }
            return await this.find(templateId);
        } catch (error) {
            throw error;
        }
    }

}

export default new TemplateServices();

export const fields: string[] = [
    "active",
    "allMats",
    "comments",
    "facilityId",
    "handicapMats",
    "name",
    "socketMats",
    "workMats",
];

export const fieldsWithId: string[] = [
    ...fields,
    "id"
];
// Private Objects -----------------------------------------------------------

const appendQuery = (options: FindOptions, query?: any): FindOptions => {

    if (!query) {
        return options;
    }
    options = appendPagination(options, query);

    // Inclusion parameters
    let include = [];
    if ("" === query.withFacility) {
        include.push(Facility);
    }
    if (include.length > 0) {
        options.include = include;
    }

    return options;

}

