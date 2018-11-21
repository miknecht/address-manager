package com.sap.cloud.s4hana.examples.addressmgr.commands;

import com.sap.cloud.sdk.s4hana.connectivity.CachingErpCommand;
import com.sap.cloud.sdk.s4hana.datamodel.odata.helper.Order;
import org.slf4j.Logger;

import java.time.Duration;
import java.util.List;

import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import com.sap.cloud.sdk.cloudplatform.cache.CacheKey;
import com.sap.cloud.sdk.cloudplatform.logging.CloudLoggerFactory;
import com.sap.cloud.sdk.s4hana.datamodel.odata.namespaces.businesspartner.BusinessPartner;
import com.sap.cloud.sdk.s4hana.datamodel.odata.services.BusinessPartnerService;

public class GetAllBusinessPartnersCommand2 extends CachingErpCommand<List<BusinessPartner>>{
	private static final Logger logger = CloudLoggerFactory.getLogger(GetAllBusinessPartnersCommand2.class);

	private static final String CATEGORY_PERSON = "1";

	private final BusinessPartnerService service;

	public GetAllBusinessPartnersCommand2(final BusinessPartnerService service) {
		super(GetAllBusinessPartnersCommand2.class);
		this.service = service;
	}

	@Override
	protected List<BusinessPartner> runCacheable() throws Exception {
		return service.getAllBusinessPartner()
				.select(BusinessPartner.FIRST_NAME, BusinessPartner.LAST_NAME, BusinessPartner.BUSINESS_PARTNER)
				.filter(BusinessPartner.BUSINESS_PARTNER_CATEGORY.eq(CATEGORY_PERSON))
				.orderBy(BusinessPartner.LAST_NAME, Order.ASC).execute();
	}

//	@Override
//	protected  CacheKey getCommandCacheKey() {
//		return CacheKey.ofTenantAndUserIsolation();
//	}
	
	@Override
	protected Cache<CacheKey, List<BusinessPartner>> getCache() {
		Duration duration = Duration.ofMinutes(5);
		return CacheBuilder.newBuilder().maximumSize(50).expireAfterWrite(duration).build();
	}

}
