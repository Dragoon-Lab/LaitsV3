<?xml version="1.0" encoding="UTF-8"?>

<!--
    Document   : ivyreport2properties.xsl
    Created on : 23 August 2010, 10:01 AM
    Author     : Bruce Chapman
    Description:
        used with ivy:resolve to generate a properties file to set the
        classpath for the conf in a property called ivy.conf.path.[conf]
        Assumes ivy:retrieve has a pattern="${ivy-retrieve-dir}/[artifact]-[revision].[ext]"
-->

<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
    <xsl:output method="text"/>

    <xsl:template match="/">
        <xsl:text>ivy.conf.path.</xsl:text><xsl:value-of select="/ivy-report/info/@conf"/>
        <xsl:text>=</xsl:text>
        <xsl:apply-templates select="//artifact[@type='jar']" />
    </xsl:template>

    <xsl:template match="artifact">
        <xsl:if test="preceding::artifact[@type='jar']">
            <xsl:text>;</xsl:text>
        </xsl:if>
        <xsl:value-of select="concat('${ivy-retrieve-dir}/',@name,'-',../../@name,'.jar')" />
    </xsl:template>

</xsl:stylesheet>
