import { env as private_env } from "$env/dynamic/private";
import CerebroApi from "$lib/utils/api";
import { type CerebroNotaxaResponse, type SampleOverviewWorkflowsResponseData, type Cerebro, type WorkflowConfig, type SampleSummarySchema, type SampleSummaryResponse, type QualityControlSummary, FileTag} from "$lib/utils/types";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

let api = new CerebroApi(private_env.PRIVATE_CEREBRO_API_URL_DOCKER);

const getLatestWorkflowId = (workflows: Array<WorkflowConfig>): string => {
    // String sort on ISO date strings - returns single one, so if multiple 
    // complete at same time (which is unlikely but not impossible) it will 
    // pick one at random
    let latestDateCompleted = workflows.map(workflow => { return workflow.completed; }).sort().reverse()[0]
    return workflows.filter(workflow => workflow.completed === latestDateCompleted)[0].id
};

export const load: PageServerLoad = async ({ params, fetch, depends }) => {

    // When we initiate the sample page, we get the latest workflow data on this sample
    // by getting the single sample overview which contains the workflow configurations

    let negativeTemplateControl: string = FileTag.NTC;   // We can get that from user settings later i.e from current user locals
    let environmentalControl: string = FileTag.ENV;   // We can get that from user settings later i.e from current user locals

    let positiveControl: string = FileTag.POS;
    
    let sampleWorkflows: Array<WorkflowConfig> = [];
    let requestedWorkflow: string;


    // Fetch the requested sample overview data to get the latest workflow if one is specified in query parameters -
    // this always needs to be done anyway so we have the workflows for selection on page load (initialisation and reloads)

    const sampleOverviewWorkflowResponse: Response = await fetch(
        `${api.routes.cerebro.sampleOverview}/${params.sample}?team=${params.team}&db=${params.db}&project=${params.project}&workflow=true`, 
        { method: 'GET', mode: 'cors', credentials: 'include' } as RequestInit
    );

    if (sampleOverviewWorkflowResponse.ok) {
        let sampleOverviewResponseData: SampleOverviewWorkflowsResponseData = await sampleOverviewWorkflowResponse.json();
        
        sampleWorkflows = sampleOverviewResponseData.data.sample_overview[0]?.workflows
    } else {
        throw error(sampleOverviewWorkflowResponse.status, "Failed to retrieve workflow overview")
    };
    
    // Initialising with latest workflow
    if (params.workflow === '0') {
        // We get the latest workflow
        requestedWorkflow = getLatestWorkflowId(sampleWorkflows);
    } else {
        // On subsequent workflow selections on the page, we reload the page with
        // the workflow identifier selected by the user
        requestedWorkflow = params.workflow;
    }

    // Now we get the Cerebro documents matching the requested sample identifier for the latest workflow

    const workflowSampleResponse: Response = await fetch(
        `${api.routes.cerebro.samples}/${params.sample}?team=${params.team}&db=${params.db}&project=${params.project}&workflow=${requestedWorkflow}`, 
        { method: 'GET', mode: 'cors', credentials: 'include' } as RequestInit
    );

    let sampleCerebro: Array<Cerebro> = [];

    if (workflowSampleResponse.ok) {
        let sampleResponseData: CerebroNotaxaResponse = await workflowSampleResponse.json();
        sampleCerebro = sampleResponseData.data.cerebro
    } else {
        throw error(workflowSampleResponse.status, "Failed to retrieve workflow sample")
    }

    let controlCerebro: Array<Cerebro> = [];
    
    if (sampleCerebro.length){

        // Get all unique run identifiers associated with these samples from the Cerebro documents
        let sampleRuns = sampleCerebro.map(cerebro => cerebro.run.id).filter((x, i, a) => a.indexOf(x) == i);
        
        // Get all run-specific negative control documents for the samples 
        const sampleControlResponse: Response = await fetch(
            `${api.routes.cerebro.workflows}/${requestedWorkflow}?team=${params.team}&db=${params.db}&project=${params.project}&runs=${sampleRuns.join(',')}&tags=${negativeTemplateControl},${environmentalControl}`, 
            { method: 'GET', mode: 'cors', credentials: 'include' } as RequestInit
        );
        
        if (sampleControlResponse.ok) {
            let workflowSampleControlsData: CerebroNotaxaResponse = await sampleControlResponse.json();
            controlCerebro = workflowSampleControlsData.data.cerebro;
        }
    }


    // Finally we return the data to the page

    depends("sample:data")

    return {
        sampleWorkflows: sampleWorkflows,
        sampleCerebro: sampleCerebro,
        controlCerebro: controlCerebro,
        requestedWorkflow: requestedWorkflow
    }
}