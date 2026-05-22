
import { Category } from "../models/category.js";

export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (error) {
        res.status(500).json({error: "Failed to fetch categories"});
    }
};

export const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if(!category) return res.status(404).json({error: "Category not found"});
        res.json(category);
    } catch (error){
        res.status(400).json({error: "Invalid ID format"});
    }
};

export const createCategory = async (req, res) => {
    try {
        const {rounds, straightsAllowed, timePerRound} = req.body;
        if(!rounds || straightsAllowed === undefined || !timePerRound) {
        return res.status(400).json({error: "Missing required fields"});
    }

    const newCategory = await Category.create({
        rounds, 
        straightsAllowed, 
        timePerRound  
    });
        res.status(201).json(newCategory);
    } catch (error) {
        res.status(400).json({error: "Could not create category"});
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const deleted = await Category.findByIdAndDelete(req.params.id);
        if(!deleted) return res.status(404).json({error:"Category not found"});
        res.json({message: "Category deleted"});
    } catch (error) {
        res.status(400).json({error: "Could not delete category"});
    }
};
