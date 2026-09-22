import RunwayML, { TaskFailedError } from "@runwayml/sdk";

export async function generateRunwayShot({promptText,promptImage,ratio="16:9",duration=5,model="gen4.5"}){
  if(!process.env.RUNWAYML_API_SECRET) throw new Error("RUNWAYML_API_SECRET is required for AI media generation.");
  const client=new RunwayML({apiKey:process.env.RUNWAYML_API_SECRET});
  try{
    const task=await client.imageToVideo.create({model,promptText,...(promptImage?{promptImage}:{}),ratio,duration}).waitForTaskOutput();
    return {model,output:task.output,taskId:task.id};
  }catch(error){
    if(error instanceof TaskFailedError) throw new Error("Runway task failed: "+JSON.stringify(error.taskDetails));
    throw error;
  }
}
