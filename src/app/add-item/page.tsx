'use client';
import React, { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import TopNavOne from '@/components/Header/TopNav/TopNavOne';
import MenuOne from '@/components/Header/Menu/MenuOne';
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb';
import Footer from '@/components/Footer/Footer';
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { useRouter } from 'next/navigation';
import Category from '@/components/Organic/Category';

const AddItem = () => {
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [itemName, setItemName] = useState('');
    const [itemType, setItemType] = useState('default');
    const [gender, setGender] = useState('default');
    const [price, setPrice] = useState('');
    const [brand, setBrand] = useState('');
    const [quantity, setQuantity] = useState('');
    const [description, setDescription] = useState('');
    const [images, setImages] = useState<File[]>([]); // State for images
    const [imagePreviews, setImagePreviews] = useState<string[]>([]); // State for image previews
    const [successMessage, setSuccessMessage] = useState('');
    const router = useRouter(); // For navigation
    const fileInputRef = useRef<HTMLInputElement | null>(null); // Reference to file input

    // Rename function to give readable names to the images
    const renameFile = (file: File, newName: string) => {
        return new File([file], newName, { type: file.type });
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const filesArray = Array.from(event.target.files).map((file, index) => {
                // Rename each file with a unique, readable name
                const newName = `${itemName || 'image'}-${index}-${Date.now()}.${file.name.split('.').pop()}`;
                return renameFile(file, newName);
            });

            setImages(filesArray);
            setImagePreviews(filesArray.map(file => URL.createObjectURL(file))); // Generate preview URLs
        }
    };


    const handleSizeChange = (size: string) => {
        setSelectedSizes(prev =>
            prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
        );
    };
    const triggerFileInput = () => {
        fileInputRef.current?.click(); // Trigger file input click
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
    
        const formData = new FormData();
    
        // Create a product object
        const productData = {
            name: itemName,
            category: "fashion",
            type: itemType,
            gender: gender,
            new: true,
            sale: false,
            rate: 5,
            price: parseInt(price, 10),
            originPrice: parseInt(price, 10),
            brand: brand,
            sold: 0,
            quantity: parseInt(quantity, 10),
            quantityPurchase: 1,
            sizes: selectedSizes,
            description: description,
            action: "quick shop",
            slug: "t-shirt",
        };
    
        // Append the product object as a JSON string
        formData.append('product', JSON.stringify(productData)); // Update this line
    
        // Append images
        images.forEach(image => formData.append('images', image)); // Add images to form data
    
        try {
            const response = await fetch('/api/add-product', {
                method: 'POST',
                body: formData,
            });
    
            if (!response.ok) throw new Error('Failed to add product');
    
            const result = await response.json();
            console.log(result);
            setSuccessMessage('Product added successfully!');
            setTimeout(() => {
                router.push('/');
            }, 3000);
        } catch (error) {
            console.error('Error adding product:', error);
        }
    };
    

    return (
        <>
            <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
            <div id="header" className='relative w-full'>
                <MenuOne props="bg-transparent" />
                <Breadcrumb heading='Add Item' subHeading='Add Item' />
            </div>
            <div className="cart-block md:py-20 py-10">
                <div className="container mx-auto px-4 md:px-10">
                    <div className="content-main flex justify-center">
                        <div className="left w-full max-w-2xl">
                            <div className="information mt-5">
                                <div className="form-checkout mt-5">
                                    <form onSubmit={handleSubmit}>
                                        <div className="grid sm:grid-cols-2 gap-4 gap-y-5">
                                            <div className="col-span-full select-block">
                                                <select
                                                    className="border border-line px-4 py-3 w-full rounded-lg"
                                                    id="type"
                                                    name="type"
                                                    value={itemType}
                                                    onChange={(e) => setItemType(e.target.value)}
                                                >
                                                    <option value="default" disabled>Choose Item Type</option>
                                                    <option value="top">Top</option>
                                                    <option value="t-shirt">T-shirt</option>
                                                    <option value="dress">Dress</option>
                                                    <option value="sets">Sets</option>
                                                    <option value="underwear">Underwear</option>
                                                    <option value="swimwear">Swimwear</option>
                                                    <option value="accessories">Accessories</option>
                                                </select>
                                                <Icon.CaretDown className='arrow-down' />
                                            </div>
                                            <div className="col-span-full">
                                                <input
                                                    className="border-line px-4 py-3 w-full rounded-lg"
                                                    id="name"
                                                    type="text"
                                                    placeholder="Item Name *"
                                                    value={itemName}
                                                    onChange={(e) => setItemName(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="col-span-full select-block">
                                                <select
                                                    className="border border-line px-4 py-3 w-full rounded-lg"
                                                    id="gender"
                                                    name="gender"
                                                    value={gender}
                                                    onChange={(e) => setGender(e.target.value)}
                                                >
                                                    <option value="default" disabled>Choose Gender</option>
                                                    <option value="men">Men</option>
                                                    <option value="women">Women</option>
                                                </select>
                                                <Icon.CaretDown className='arrow-down' />
                                            </div>
                                            <div className="col-span-full">
                                                <input
                                                    className="border-line px-4 py-3 w-full rounded-lg"
                                                    id="price"
                                                    type="number"
                                                    placeholder="Price *"
                                                    value={price}
                                                    onChange={(e) => setPrice(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="col-span-full">
                                                <input
                                                    className="border-line px-4 py-3 w-full rounded-lg"
                                                    id="brand"
                                                    type="text"
                                                    placeholder="Brand *"
                                                    value={brand}
                                                    onChange={(e) => setBrand(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="col-span-full">
                                                <input
                                                    className="border-line px-4 py-3 w-full rounded-lg"
                                                    id="quantity"
                                                    type="number"
                                                    placeholder="Quantity Available *"
                                                    value={quantity}
                                                    onChange={(e) => setQuantity(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="col-span-full">
                                                <label className="block mb-2">Available Sizes *</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {["XS", "S", "M", "L", "XL", "2XL"].map(size => (
                                                        <label key={size} className="flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                className="hidden"
                                                                value={size}
                                                                checked={selectedSizes.includes(size)}
                                                                onChange={() => handleSizeChange(size)}
                                                            />
                                                            <span
                                                                className={`border border-line rounded-lg px-4 py-2 cursor-pointer transition duration-300 ease-in-out 
                                                                    ${selectedSizes.includes(size) ? 'bg-blue-500 text-yellow' : 'hover:bg-gray-200'}`}
                                                            >
                                                                {size}
                                                            </span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="col-span-full">
                                                <textarea
                                                    className="border-line px-4 py-3 w-full rounded-lg"
                                                    id="description"
                                                    placeholder="Description *"
                                                    value={description}
                                                    onChange={(e) => setDescription(e.target.value)}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    className="bg-blue-500 px-4 py-2 rounded-lg cursor-pointer"
                                                    onClick={triggerFileInput}
                                                    style={{ display: 'inline-block' }} // Make sure it's inline and visible
                                                >
                                                    Select Images
                                                </button>
                                                <input
                                                    type="file"
                                                    multiple
                                                    ref={fileInputRef}
                                                    onChange={handleImageChange}
                                                    style={{ display: 'none' }} // Hide the actual file input
                                                />
                                            </div>
                                        </div>
                                        {/* Image Previews */}
                                        <div className="image-preview-container flex flex-wrap gap-4 mb-4">
                                            {imagePreviews.map((preview, index) => (
                                                <div key={images[index].name} className="image-preview w-24 h-24 border rounded overflow-hidden">
                                                    <img src={preview} alt={`Selected preview ${index}`} className="object-cover w-full h-full" />
                                                </div>
                                            ))}
                                        </div>

                                        <div className="block-button md:mt-10 mt-6">
                                            <button type="submit" className="bg-black text-white button-main w-full">Add Item</button>
                                        </div>
                                    </form>
                                    {successMessage && (
                                        <div className="mt-4 flex items-center text-green-600">
                                            <Icon.CheckCircle className="mr-2 animate-checkmark" />
                                            <span>{successMessage}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default AddItem;
