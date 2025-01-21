import React, { useState, useEffect } from "react";
import axios from "axios";

const CategorySelector = ({ onSelectCategory }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("/api/categories");
        setCategories(response.data);
      } catch (error) {
        console.error("Error al obtener las categorías:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryChange = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    setSelectedCategory(category);
    setSelectedSubcategory(null); // Reinicia la subcategoría seleccionada
  };

  const handleSubcategoryChange = (subcategoryId) => {
    const subcategory = selectedCategory.subcategories.find(
      (sub) => sub.id === subcategoryId
    );
    setSelectedSubcategory(subcategory);
  };

  const handleConfirmSelection = () => {
    if (selectedCategory && selectedSubcategory) {
      onSelectCategory(selectedCategory, selectedSubcategory);
    }
  };

  return (
    <div className="bg-white p-5 rounded shadow-md w-full max-w-md text-center">
      <h2 className="text-xl font-bold mb-4">Selecciona una Categoría</h2>

      {/* Categorías */}
      <select
        className="w-full p-2 mb-4 border rounded"
        value={selectedCategory?.id || ""}
        onChange={(e) => handleCategoryChange(parseInt(e.target.value))}
      >
        <option value="" disabled>
          Selecciona una categoría
        </option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>

      {/* Subcategorías */}
      {selectedCategory && selectedCategory.subcategories.length > 0 && (
        <>
          <h3 className="text-lg font-semibold mb-2">Subcategorías</h3>
          <select
            className="w-full p-2 mb-4 border rounded"
            value={selectedSubcategory?.id || ""}
            onChange={(e) => handleSubcategoryChange(parseInt(e.target.value))}
          >
            <option value="" disabled>
              Selecciona una subcategoría
            </option>
            {selectedCategory.subcategories.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </>
      )}

      {/* Botón para confirmar */}
      <button
        className="bg-blue-500 text-white py-2 px-4 rounded disabled:bg-gray-300"
        onClick={handleConfirmSelection}
        disabled={!selectedCategory || !selectedSubcategory}
      >
        Confirmar
      </button>
    </div>
  );
};

export default CategorySelector;
