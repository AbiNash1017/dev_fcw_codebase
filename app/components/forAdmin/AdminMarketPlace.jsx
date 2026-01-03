import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/app/context/AuthContext'
import { storage } from '@/firebaseConfig'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { Edit, Loader, Trash, Upload, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { ChangeEvent, useEffect, useRef, useState } from 'react'

const AdminMarketPlace = () => {
    const { user, loading } = useAuth()
    const [products, setProducts] = useState([])
    const [newProduct, setNewProducts] = useState({
        product_name: '',
        price: 0,
        image: ''
    })
    const [currentProduct, setCurrentProducts] = useState({
        id: 0,
        product_name: '',
        price: 0,
        image: ''
    })
    const [productImage, setProductImage] = useState(null)
    const [imagePreview, setImagePreview] = useState(null);
    const [editImagePreview, setEditImagePreview] = useState(null);
    const fileInputRef = useRef(null);
    const [orders, setOrders] = useState(null);
    const router = useRouter()

    const fetchProducts = async () => {
        try {
            if (!user) return;
            const token = await user.getIdToken();
            const response = await fetch(`/api/admin/marketPlace/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })

            if (!response.ok) {
                alert('Failed to fetch products')
            }
            console.log("aldskjfldksfj reached")
            const data = await response.json()
            const fetchedProducts = data.data
            console.log(fetchedProducts)
            setProducts(fetchedProducts)
        } catch (error) {
            console.error('Error fetching products:', error)
        }
    }

    const addProduct = async (product) => {
        try {
            if (!user) return;
            const token = await user.getIdToken();
            const { product_name, price, image } = product;
            console.log('Sending product:', JSON.stringify(product));
            console.log(product_name, price, image, productImage)
            const response = await fetch(`/api/admin/marketPlace/addItem`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    product_name,
                    price: Number(price),
                    image
                })
            })
            const data = await response.json();
            console.log("reached")
            console.log(data.message)
            if (data.message === 'OK') {
                alert('product added successfully!');
                fetchProducts();
            } else {
                alert('Error adding product!');
            }
        } catch (error) {
            console.error("Error adding product:", error);
        }
    }

    const handleDeleteProduct = async (id) => {
        console.log(id)
        if (!user) return;
        const token = await user.getIdToken();
        const response = await fetch(`/api/admin/marketPlace/deleteProduct/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        const data = await response.json()
        if (data.message === 'OK') {
            alert("successful")
        } else {
            alert("Error deleting product")
        }
        fetchProducts()
    }

    const handleEditProduct = async (product) => {
        console.log(product.id)
        console.log(product)
        if (!user) return;
        const token = await user.getIdToken();
        let image = editImagePreview || product.image;
        const { product_name, price } = product;
        console.log(product_name, price, image)
        const response = await fetch(`/api/admin/marketPlace/editProduct/${product.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                product_name,
                price,
                image
            })
        })
        const data = await response.json()
        if (data.message === "OK") {
            alert("Edit successful!")
            fetchProducts()
        }
        else
            alert('error editing product')
    }

    const uploadImageToFirebase = async (file, pathPrefix) => {
        try {
            const storageRef = ref(storage, `${pathPrefix}/${Date.now()}-${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const publicUrl = await getDownloadURL(snapshot.ref);
            return publicUrl;
        } catch (error) {
            console.error('Image upload failed:', error);
            return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await addProduct({
            ...newProduct,
            image: imagePreview || newProduct.image,
        });

        setNewProducts({
            product_name: '',
            price: 0,
            image: ''
        });

        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmitEdit = (e) => {
        e.preventDefault();
        if (currentProduct) {
            handleEditProduct(currentProduct);
        }

        setEditImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setNewProducts(prev => ({ ...prev, [name]: value }))
    }

    const handleImageChange = async (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const uploadedImageUrl = await uploadImageToFirebase(file, 'products');

            if (uploadedImageUrl) {
                setImagePreview(uploadedImageUrl);
                setNewProducts((prev) => ({
                    ...prev,
                    image: uploadedImageUrl,
                }));
            } else {
                console.error('Image upload failed');
            }
        }
    };

    const handleEditImageChange = async (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const uploadedImageUrl = await uploadImageToFirebase(file, 'products');
            if (uploadedImageUrl) {
                setEditImagePreview(uploadedImageUrl);
                setCurrentProducts((prev) => ({ ...prev, banner_image: uploadedImageUrl }));
            } else {
                console.error('Image upload failed');
            }
        }
    };

    const fetchOrders = async () => {
        try {
            if (!user) return;
            const token = await user.getIdToken();
            const response = await fetch(`/api/admin/marketPlace/orders`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            const data = await response.json();

            const mappedOrders = data.data.map((item) => ({
                id: item.id,
                quantity: item.quantity,
                totalPrice: item.total_price,
                paymentId: item.payment_id,
                productName: item.product.product_name,
                userId: item.user_id,
                userName: `${item.customer.first_name} ${item.customer.last_name}`,
            }));

            setOrders(mappedOrders);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchProducts()
            fetchOrders()
        }
    }, [user])

    return (
        <div className="space-y-3">
            <Card>
                <CardHeader>
                    <CardTitle>Add Item</CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="space-y-3" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="product_name">
                                    Item Name <span className="text-red-500 text-lg">*</span>
                                </Label>
                                <Input
                                    id="product_name"
                                    name="product_name"
                                    type="text"
                                    required
                                    value={newProduct.product_name}
                                    onChange={handleInputChange}
                                    placeholder='Enter name'
                                />
                            </div>
                            <div>
                                <Label htmlFor="price">
                                    Item Price <span className="text-red-500 text-lg">*</span>
                                </Label>
                                <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    required
                                    value={newProduct.price}
                                    onChange={handleInputChange}
                                    placeholder='Enter price'
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="image" className="block text-sm">Product Image</label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="mt-1"
                            />
                            {imagePreview && <img src={imagePreview} alt="Image Preview" className="mt-2 w-32 h-32 object-cover" />}
                        </div>

                        <Button type="submit" className="w-auto mt-8 bg-red-600 hover:bg-red-700">
                            Add Product
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Marketplace Products</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Image</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products?.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell>{product.product_name}</TableCell>
                                    <TableCell>{product.price}</TableCell>
                                    <TableCell><img src={product.image} alt={product.product_name} className="w-16 h-16 object-cover rounded-md" /></TableCell>
                                    <TableCell>
                                        <div className="flex space-x-2">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="ghost" size="sm" onClick={() => { setCurrentProducts(product) }}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Edit Product</DialogTitle>
                                                        <DialogDescription>Make changes to the product here.</DialogDescription>
                                                    </DialogHeader>
                                                    {currentProduct && (
                                                        <form onSubmit={handleSubmitEdit}>
                                                            <div className="grid gap-4 py-4">
                                                                <div className="grid grid-cols-4 items-center gap-4">
                                                                    <Label htmlFor="edit-product-name" className="text-right">Name</Label>
                                                                    <Input
                                                                        id="edit-product-name"
                                                                        value={currentProduct.product_name || ""}
                                                                        onChange={(e) => setCurrentProducts({ ...currentProduct, product_name: e.target.value })}
                                                                        className="col-span-3"
                                                                    />
                                                                </div>
                                                                <div className="grid grid-cols-4 items-center gap-4">
                                                                    <Label htmlFor="edit-price" className="text-right">Price</Label>
                                                                    <Input
                                                                        id="edit-price"
                                                                        value={currentProduct.price || ""}
                                                                        onChange={(e) => setCurrentProducts({ ...currentProduct, price: Number(e.target.value) })}
                                                                        className="col-span-3"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label htmlFor="image" className="block text-sm">Product Image</label>
                                                                    <input
                                                                        ref={fileInputRef}
                                                                        type="file"
                                                                        accept="image/*"
                                                                        onChange={handleEditImageChange}
                                                                        className="mt-1"
                                                                    />
                                                                    {editImagePreview && <img src={editImagePreview} alt="Product Preview" className="mt-2 w-16 h-16 object-cover rounded" />}
                                                                </div>
                                                            </div>
                                                            <Button className="bg-red-600 hover:bg-red-700" type="submit" >
                                                                Save changes
                                                            </Button>
                                                        </form>
                                                    )}
                                                </DialogContent>
                                            </Dialog>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete the product
                                                            and remove the data from our servers.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction className='bg-red-600 hover:bg-red-700' onClick={() => handleDeleteProduct(product.id)}>
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableCell>User Name</TableCell>
                                <TableCell>User ID</TableCell>
                                <TableCell>Product Name</TableCell>
                                <TableCell>Quantity</TableCell>
                                <TableCell>Total Price</TableCell>
                                <TableCell>Payment ID</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {
                                orders?.map((order) => {
                                    return (
                                        <TableRow key={order.id}>
                                            <TableCell>{order.userName}</TableCell>
                                            <TableCell>{order.userId}</TableCell>
                                            <TableCell>{order.productName}</TableCell>
                                            <TableCell>{order.quantity}</TableCell>
                                            <TableCell>{order.totalPrice}</TableCell>
                                            <TableCell>{order.paymentId}</TableCell>
                                        </TableRow>
                                    )
                                })
                            }
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

export default AdminMarketPlace
