// 'use client'

// import { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import dynamic from 'next/dynamic'
// import 'leaflet/dist/leaflet.css'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Textarea } from '@/components/ui/textarea'

// const MapComponent = dynamic(() => import('@/components/MapComponent'), {
//   ssr: false
// })

// // Assuming we have a basic auth check function
// import { isAuthenticated } from '@/lib/auth'

// export default function Profile() {
//   const router = useRouter()
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     address: ''
//   })
//   const [location, setLocation] = useState({
//     latitude: 40.7128,
//     longitude: -74.006,
//     zoom: 13
//   })

//   useEffect(() => {
//     // Check if the user is authenticated
//     if (!isAuthenticated()) {
//       router.push('/login')
//     } else {
//       // Fetch user data from API and set it in the form
//       // This is a placeholder and should be replaced with actual API call
//       setFormData({
//         name: 'John Doe',
//         email: 'john@example.com',
//         phone: '123-456-7890',
//         address: '123 Main St, New York, NY 10001'
//       })
//     }
//   }, [router])

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => {
//     const { name, value } = e.target
//     setFormData((prevData) => ({ ...prevData, [name]: value }))
//   }

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault()
//     // Handle form submission logic here
//   }

//   return (
//     <div className='container mx-auto px-4 py-8'>
//       <h1 className='text-3xl font-bold mb-6'>Your Profile</h1>
//       <form onSubmit={handleSubmit} className='space-y-4 max-w-2xl'>
//         <div>
//           <label htmlFor='name' className='block mb-1'>
//             Name
//           </label>
//           <Input
//             type='text'
//             id='name'
//             name='name'
//             value={formData.name}
//             onChange={handleChange}
//             required
//           />
//         </div>
//         <div>
//           <label htmlFor='email' className='block mb-1'>
//             Email
//           </label>
//           <Input
//             type='email'
//             id='email'
//             name='email'
//             value={formData.email}
//             onChange={handleChange}
//             required
//           />
//         </div>
//         <div>
//           <label htmlFor='phone' className='block mb-1'>
//             Phone
//           </label>
//           <Input
//             type='tel'
//             id='phone'
//             name='phone'
//             value={formData.phone}
//             onChange={handleChange}
//           />
//         </div>
//         <div>
//           <label htmlFor='address' className='block mb-1'>
//             Address
//           </label>
//           <Textarea
//             id='address'
//             name='address'
//             value={formData.address}
//             onChange={handleChange}
//             rows={3}
//           />
//         </div>
//         {/* <div>
//           <label className="block mb-1">Location</label>
//           <div style={{ height: "300px", width: "100%" }}>
//             <MapComponent
//               center={[location.longitude, location.latitude]}
//               zoom={location.zoom}
//               onLocationSelected={(lat, lng) => setLocation({ ...location, latitude: lat, longitude: lng })}
//             />
//           </div>
//         </div> */}
//         <Button type='submit' className='w-full'>
//           Update Profile
//         </Button>
//       </form>
//     </div>
//   )
// }
