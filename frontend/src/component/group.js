import { useEffect, useState } from "react";

export function Group() {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
    //   const response = await fetch("/api/group");
      const response = await fetch("http://localhost:5000/api/group");
      const data = await response.json();
      setGroups(data);
    };
    fetchData();
  }, []);

  return (
    <div>
      <h1>Groups</h1>
      {groups.map((group) => (
        <div key={group.id}>
          <h2>{group.name}</h2>
          <p>{group.address}</p>
        </div>
      ))}
    </div>
  );
}
