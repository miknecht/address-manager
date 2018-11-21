package com.sap.cloud.s4hana.examples.addressmgr.commands;

import org.slf4j.Logger;

import com.sap.cloud.sdk.cloudplatform.logging.CloudLoggerFactory;
import com.sap.cloud.sdk.s4hana.connectivity.ErpCommand;
import com.sap.cloud.sdk.s4hana.datamodel.odata.namespaces.businesspartner.BusinessPartnerAddress;
import com.sap.cloud.sdk.s4hana.datamodel.odata.services.BusinessPartnerService;

public class CreateAddressCommand2 extends ErpCommand<BusinessPartnerAddress>{
	private static final Logger logger = CloudLoggerFactory.getLogger(CreateAddressCommand2.class);

	private final BusinessPartnerService service;
	private final BusinessPartnerAddress addressToCreate;

	public CreateAddressCommand2(final BusinessPartnerService service, final BusinessPartnerAddress addressToCreate) {
		super(CreateAddressCommand2.class);
		this.service = service;
		this.addressToCreate = addressToCreate;
	}

	@Override
	protected BusinessPartnerAddress run() throws Exception {
		return service.createBusinessPartnerAddress(addressToCreate).execute();
	}

}
