<script lang="ts">
    import { page } from "$app/stores";
	import type { Taxon, TaxonEvidence } from "$lib/utils/types";
    import type { ModalComponent, ModalSettings } from "@skeletonlabs/skeleton";

    export let taxonEvidence: TaxonEvidence;

    let taxonData: Taxon;

    let modalComponent: ModalComponent;
    let modal: ModalSettings;


</script>

<div class="p-8 mt-4">
        
    <div class="flex align-center">
        
        <div class="ml-auto gap-y-4 flex flex-col text-sm">
            <button class="btn btn-sm variant-outline-primary mr-2" type="button">
                <div class="h-5 w-5 mr-2">
                    <svg aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" stroke-linecap="round" stroke-linejoin="round"></path>
                    </svg>
                </div>
            </button>
            <button class="btn btn-sm variant-outline-primary mr-2" type="button">
                <div class="h-5 w-5 mr-2">
                    <svg aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33" stroke-linecap="round" stroke-linejoin="round"></path>
                    </svg>
                </div>
                Candidate
            </button>
        </div>
    </div>
</div>