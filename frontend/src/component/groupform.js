import { useState } from 'react';

export function GroupForm() {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [owner, setOwner] = useState('');

  const handleCreateGroup = async () => {
    const response = await fetch('http://localhost:5000/api/group', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, address, owner }),
    });
    const data = await response.json();
    console.log(data);
  };

  const handleUpdateGroup = async () => {
    const response = await fetch(`http://localhost:5000/api/group/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, address, owner }),
    });
    const data = await response.json();
    console.log(data);
  };

  const handleDeleteGroup = async () => {
    const response = await fetch(`http://localhost:5000/api/group/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    console.log(data);
  };

  return (
    <div>
      <input
        value={id}
        onChange={(e) => setId(e.target.value)}
        placeholder="ID (for update/delete)"
      />
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
      />
      <input
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Address"
      />
      <input
        value={owner}
        onChange={(e) => setOwner(e.target.value)}
        placeholder="Owner"
      />
      <button onClick={handleCreateGroup}>Create</button>
      <button onClick={handleUpdateGroup}>Update</button>
      <button onClick={handleDeleteGroup}>Delete</button>
    </div>
  );
}



// import { useState } from "react";

// export default function Home() {
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     const response = await fetch("/api/users", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         name,
//         email,
//       }),
//     });
//     const data = await response.json();
//     console.log(data);
//   };

//   return (
//     <div>
//       <form onSubmit={handleSubmit}>
//         <input
//           type="text"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           placeholder="Name"
//         />
//         <input
//           type="email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           placeholder="Email"
//         />
//         <button type="submit">Submit</button>
//       </form>
//     </div>
//   );
// }
