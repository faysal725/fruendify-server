/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
const httpStatus = require('http-status');
const responseHandler = require('../../helper/responseHandler');
const Religion = require('../../models/Religion');
const Language = require('../../models/Language');
const Education = require('../../models/Education');
const Diet = require('../../models/Diet');
const Category = require('../../models/Category');
const Music = require('../../models/Music');
const Politic = require('../../models/Politic');
const Industry = require('../../models/Industry');

class PublicService {
    constructor() {
        this.ReligionDao = Religion;
        this.LanguageDao = Language;
        this.EducationDao = Education;
        this.DietDao = Diet;
        this.CategoryDao = Category;
        this.MusicDao = Music;
        this.PoliticDao = Politic;
        this.IndustryDao = Industry;
    }

    getReligionList = async () => {
        const response = await this.ReligionDao.find();

        return responseHandler.returnSuccess(httpStatus.OK, 'Religion data found', response);
    };

    getLanguageList = async () => {
        const response = await this.LanguageDao.find();

        return responseHandler.returnSuccess(httpStatus.OK, 'Language data found', response);
    };

    getEducationList = async () => {
        const response = await this.EducationDao.find();

        return responseHandler.returnSuccess(httpStatus.OK, 'Education data found', response);
    };

    getDietList = async () => {
        const response = await this.DietDao.find();

        return responseHandler.returnSuccess(httpStatus.OK, 'Diet data found', response);
    };

    getAllcategoryLists = async () => {
        const results = await this.CategoryDao.find();
        const domain = process.env.MAIN_DOMAIN;
        const modifiedData = results.map((category) => {
            const imageUrl = category.image ? domain + category.image : null;
            category.image = imageUrl;
            return category;
        });

        return responseHandler.returnSuccess(httpStatus.OK, 'Category data found', modifiedData);
    };

    getMusicList = async () => {
        const response = await this.MusicDao.find();

        return responseHandler.returnSuccess(httpStatus.OK, 'Music data found', response);
    };

    getPoliticList = async () => {
        const response = await this.PoliticDao.find();

        return responseHandler.returnSuccess(httpStatus.OK, 'Politic data found', response);
    };

    getIndustryList = async () => {
        const response = await this.IndustryDao.find();

        return responseHandler.returnSuccess(httpStatus.OK, 'Industry data found', response);
    };
}

module.exports = PublicService;
