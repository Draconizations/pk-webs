import { rawTimeZones } from "@vvo/tzdb";

interface SystemPrivacy {
    description_privacy?: string | boolean | null,
    member_list_privacy?: string | boolean | null,
    front_privacy?: string | boolean | null,
    front_history_privacy?: string | boolean | null
}

function validateSystem(data: Sys) {
    if (data.name && data.name.length > 100) {
        console.log(`Name is too long (${data.name.length} > 100 characters)`);
        return false;
    }
    if (data.description && data.description.length > 1000) {
        console.log(`Name is too long (${data.description.length} > 1000 characters)`);
        return false;
    }
    if (data.avatar_url && !new URL(data.avatar_url)) {
        console.log(`Avatar url is not a valid URL`);
        return false;
    }
    if (data.banner && !new URL(data.banner)){
        console.log(`Banner url is not a valid URL`);
        return false;
    }
    if (data.tz && !isValidTimezone(data.tz)) {
        console.log(`${data.tz} is not a valid timezone`);
        return false;
    }
    if (data.privacy) {
        for(var [, value] of Object.entries(data.privacy)) {
            if (value === true) value = 'public';
            if (value === false) value = 'private';
        }
    }
    return true;
}

function isValidTimezone(timezone: string) {
    var raw = rawTimeZones.find(tz => {
        return ([
            tz.name.toLowerCase(),
            tz.abbreviation.toLowerCase(),
            tz.alternativeName.toLowerCase()
        ]).includes(timezone.toLowerCase());
    })
    return raw;
}

export default class Sys {
    id?: string;
    name?: string;
    description?: string;
    tag?: string;
    avatar_url?: string;
    banner?: string;
    tz?: string;
    created?: string;
    privacy?: SystemPrivacy;
    color?: string;

    constructor(data: any) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.tag = data.tag;
        this.avatar_url = data.avatar_url;
        this.banner = data.banner;
        this.tz = data.timezone;
        this.created = data.created;
        this.color = data.color;
        if (data.privacy) {
            this.privacy = {
                description_privacy: data.privacy.description_privacy,
                member_list_privacy: data.privacy.member_list_privacy,
                front_privacy: data.privacy.front_privacy,
                front_history_privacy: data.privacy.front_history_privacy
            }
        }
    }
}