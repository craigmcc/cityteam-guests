// FacilityTemplateServices --------------------------------------------------

// Services implementation for Facility -> Template models.

// External Modules ----------------------------------------------------------

import { FindOptions, Op } from "sequelize";

// Internal Modules ----------------------------------------------------------

import {
    fields as templateFields, fieldsWithId as templateFieldsWithId
} from "./TemplateServices";
import Facility from "../models/Facility";
import Template from "../models/Template";
import { Forbidden, NotFound } from "../util/http-errors";
import { appendPagination } from "../util/query-parameters";
import { TEMPLATE_ORDER } from "../util/sort-orders";

// Public Objects ------------------------------------------------------------

class FacilityTemplateServices {

    public async templatesActive(facilityId: number, query?: any): Promise<Template[]> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.templatesActive()");
        }
        const options: FindOptions = appendQuery({
            order: TEMPLATE_ORDER,
            where: {
                active: true,
            },
        }, query);
        return await facility.$get("templates", options);
    }

    public async templatesAll(facilityId: number, query?: any): Promise<Template[]> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.templatesAll()");
        }
        const options: FindOptions = appendQuery({
            order: TEMPLATE_ORDER
        }, query);
        return await facility.$get("templates", options);
    }

    public async templatesExact(
        facilityId: number,
        name: string,
        query?: any
    ): Promise<Template> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.templatesExact()");
        }
        const options: FindOptions = appendQuery({
            order: TEMPLATE_ORDER,
            where: {
                name: name
            },
        }, query);
        let results = await facility.$get("templates", options);
        if (results.length < 1) {
            throw new NotFound(
                `names: Missing Template '${name}'`,
                "FacilityServices.templatesExact()");
        }
        return results[0];
    }

    public async templatesInsert(
        facilityId: number, template: Template
    ): Promise<Template> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.templatesInsert()");
        }
        template.facilityId = facilityId; // No cheating
        return await Template.create(template, {
            fields: templateFields,
        });
    }

    public async templatesName(
        facilityId: number, name: string, query?: any
    ): Promise<Template[]> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.templatesName()");
        }
        const options: FindOptions = appendQuery({
            order: TEMPLATE_ORDER,
            where: {
                name: {[Op.iLike]: `%${name}%`},
            },
        }, query);
        return await facility.$get("templates", options);
    }

    public async templatesRemove(
        facilityId: number, templateId: number
    ) : Promise<Template> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.templatesRemove()");
        }
        const removed = await Template.findByPk(templateId);
        if (!removed) {
            throw new NotFound(
                `templateId: Missing Template ${templateId}`,
                "FacilityServices.templatesRemove()");
        }
        if (removed.facilityId !== facility.id) { // No cheating
            throw new Forbidden(
                `templateId: Template ${templateId} does not belong to this Facility`,
                "FacilityServices.templatesRemove()");
        }
        const count = await Template.destroy({
            where: { id: templateId }
        });
        if (count < 1) {
            throw new NotFound(
                `templateId: Cannot remove Template ${templateId}`,
                "FacilityServices.templatesRemove()");
        }
        return removed;
    }

    public async templatesUpdate(
        facilityId: number, templateId: number, template: Template
    ) : Promise<Template> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.templatesUpdate()");
        }
        const updated = await Template.findByPk(templateId);
        if (!updated) {
            throw new NotFound(
                `templateId: Missing Template ${templateId}`,
                "FacilityServices.templatesUpdate()");
        }
        if (updated.facilityId !== facility.id) { // No cheating
            throw new Forbidden(
                `templateId: Template ${templateId} does not belong to this Facility`,
                "FacilityServices.templatesUpdate()");
        }
        template.id = templateId; // No cheating
        const result: [number, Template[]] = await Template.update(template, {
            fields: templateFieldsWithId,
            returning: true,
            where: { id: templateId }
        })
        if (result[0] < 1) {
            throw new NotFound(
                `templateId: Cannot update Template ${templateId}`,
                "FacilityServices.templatesUpdate()"
            )
        }
        return result[1][0];
    }

}

export default new FacilityTemplateServices();

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
