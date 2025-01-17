const { flattenString } = require("./flattenString");

const item1 = ["From: Welsh Karen <Karen.Welsh@gstt.nhs.uk> Date: Thursday, 8 February 2024 at 09:36 To: :MRI Physics <MRIPhysics@gstt.nhs.uk> Cc: Touska Philip <Philip.Touska@gstt.nhs.uk>, OBrien Caitlin <Caitlin.OBrien@gstt.nhs.uk> Subject: Topss scan for the diary","Morning lovely team","We have a lovely lady coming for a TOPSS scan on Friday 23rd February @13:50 GMRI4.","If you could add this to the day Diary for support that would be amazing.","Lisa Brown MRN: 39194464 ","Best wishes","Karen","￼",""];
const item2 = ["From: Welsh Karen <Karen.Welsh@gstt.nhs.uk> Date: Thursday, 8 February 2024 at 09:36 To: :MRI Physics <MRIPhysics@gstt.nhs.uk> Cc: Touska Philip <Philip.Touska@gstt.nhs.uk>, OBrien Caitlin <Caitlin.OBrien@gstt.nhs.uk> Subject: Topss scan for the diary","Morning lovely team","We have a lovely lady coming for a TOPSS scan on Friday 23rd February @13:50 GMRI4.","If you could add this to the day Diary for support that would be amazing.","Lisa Brown MRN: 39194464 ","Best wishes","Karen","",""];

const a1 = JSON.stringify(item1)
const a2 = JSON.stringify(item2)

console.log(flattenString(a1))
console.log(flattenString(a2))


